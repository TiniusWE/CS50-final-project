from flask import Flask, render_template, request, jsonify, send_file
from data import get_hp, get_company_data, get_company_news
import pandas as pd
import os

app = Flask(__name__)


@app.route("/")
def index():
    # Render main search page
    return render_template("index.html")

@app.route("/information")
def information():
    return render_template("information.html")


@app.route("/search")
def search():
    # Fetch company data
    ticker = request.args.get("ticker", "").upper()

    if not ticker:
        return jsonify({"error": "Missing ticker"}), 400

    try:
        info, metrics, price = get_company_data(ticker)
        prices = get_hp(ticker)
        news = get_company_news(ticker)

        return jsonify({
            "info": info,
            "prices": prices.to_dict(orient="records"),
            "metrics": metrics,
            "price": price,
            "news": news
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/download")
def download():
    # Generate and return a CSV file with historical prices
    ticker = request.args.get("ticker", "").upper()
    try:
        years = int(request.args.get("years", 1))
    except ValueError:
        return "Invalid years", 400
    freq = request.args.get("freq")

    interval_map = {
        "daily": "1d",
        "weekly": "1wk",
        "monthly": "1mo",
        "quarterly": "3mo"
    }

    interval = interval_map.get(freq)

    if not interval:
        return "Invalid frequency", 400

    period = f"{years}y"

    try:
        df = get_hp(
            ticker,
            period=period,
            interval=interval
        )
    except Exception as e:
        return f"Failed to fetch data: {str(e)}", 400

    if df is None or df.empty:
        return "No data available", 400

    from io import BytesIO
    csv_buffer = BytesIO()
    df.to_csv(csv_buffer, index=False)
    csv_buffer.seek(0)

    return send_file(
        csv_buffer,
        mimetype="text/csv",
        as_attachment=True,
        download_name=f"{ticker}_{freq}_{years}y.csv"
    )


if __name__ == "__main__":
    os.makedirs("downloads", exist_ok=True)
    app.run(debug=True)
