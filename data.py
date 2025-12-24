import yfinance as yf


def format_number(value):
    if value is None:
        return "N/A"
    if value >= 1e12:
        return f"{value/1e12:.2f}T"
    if value >= 1e9:
        return f"{value/1e9:.2f}B"
    if value >= 1e6:
        return f"{value/1e6:.2f}M"
    return f"{value:,}"

def format_float(value):
    if value is None:
        return "N/A"
    try:
        return f"{float(value):.2f}"
    except (ValueError, TypeError):
        return "N/A"


def format_percent(value):
    if value is None:
        return "N/A"
    try:
        value = float(value)

        # If value already is in percent
        if value > 1:
            return f"{value:.2f}%"

        return f"{value * 100:.2f}%"
    except (ValueError, TypeError):
        return "N/A"


def get_company_data(ticker: str):
    # Fetch and process all company related data for a given ticker
    stock = yf.Ticker(ticker)

    info = stock.get_info() or {}
    fast = stock.fast_info or {}

    # Price sources
    last_price = (
        info.get("regularMarketPrice")
        or fast.get("last_price")
    )

    market_state = info.get("marketState")

    if market_state == "REGULAR":
        ref_price = info.get("regularMarketOpen")
    else:
        ref_price = info.get("previousClose") or fast.get("previous_close")

    # Change calculation
    if last_price is not None and ref_price not in (None, 0):
        change = last_price - ref_price
        change_pct = (change / ref_price) * 100
    else:
        change = None
        change_pct = None

    # Use the last two closing prices as a final safeguard
    if change is None and last_price is not None:
        hist = stock.history(period="2d")
        if len(hist) >= 2:
            prev_close = hist["Close"].iloc[-2]
            change = last_price - prev_close
            change_pct = (change / prev_close) * 100

    metrics = [
    ("Market Cap", format_number(info.get("marketCap") or fast.get("market_cap"))),
    ("Shares Outstanding", format_number(info.get("sharesOutstanding"))),
    ("Dividend Payout Ratio", format_percent(info.get("payoutRatio"))),
    ("Dividend Yield", format_percent(info.get("dividendYield"))),
    ("EPS (TTM)", format_float(info.get("trailingEps"))),
    ("P/E Ratio", format_float(info.get("trailingPE"))),
    ("Forward P/E", format_float(info.get("forwardPE"))),
    ("Price / Book", format_float(info.get("priceToBook"))),
    ("Avg Volume (3M)", format_number(info.get("averageVolume"))),
    ("Beta", format_float(info.get("beta"))),
    ]

    description = {
        "name": info.get("shortName"),
        "sector": info.get("sector"),
        "industry": info.get("industry"),
        "description": info.get("longBusinessSummary"),
    }

    price_data = {
        "price": round(last_price, 2) if last_price else None,
        "change": round(change, 2) if change is not None else None,
        "change_pct": round(change_pct, 2) if change_pct is not None else None,
    }

    return description, metrics, price_data


def get_hp(ticker, period="1y", interval="1d"):
    stock = yf.Ticker(ticker)
    df = stock.history(period=period, interval=interval)
    df.reset_index(inplace=True)
    return df

def get_company_news(ticker: str, limit: int = 5):
    stock = yf.Ticker(ticker)
    raw_news = stock.news or []

    formatted = []

    for item in raw_news:
        content = item.get("content", {})

        title = content.get("title")
        link = (
            content.get("clickThroughUrl", {}) or {}
        ).get("url")

        publisher = (
            content.get("provider", {}) or {}
        ).get("displayName")

        pub_date = content.get("pubDate")

        # Skip invalid items
        if not title or not link:
            continue

        formatted.append({
            "title": title,
            "publisher": publisher,
            "link": link,
            "time": pub_date,
        })

        if len(formatted) >= limit:
            break

    return formatted
