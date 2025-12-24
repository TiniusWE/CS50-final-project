# Terminal.
#### Video Demo:  https://youtu.be/DYttlTvvmNk
#### Description:

I have for a long time wanted to be able to download historical data for individual stocks as well as market indices. Earlier i have been using the Bloomberg terminal which i have access to through my school. However the Bloomberg terminal is not easily accessible. Therefore, for my final project, i decided to build a web application which mimmics some core features of the Bloomberg terminal. Allthough, in reality i am barely scratching the surface, I still think my project can prove useful in the future for me and also my peers.

The application allows useres to search for stocks and indices by typing their ticker symbol. After searching a ticker the user is presented with company information, the current price and intraday change, a simple one-year time series chart, a column of key metrics and ratios, recent company news, and a downlaod option.

My terminal supports these listed features:
    - Search stocks, indices, & government bonds
    - Display company name, sector, industry, and description
    - Display current price and intraday change
    - Renders a one-year price chart
    - Display key metrics & ratios
    - Show company related news articles
    - Download historical data as a CSV file

I built the project using Python and JavaScript, and i used Yahoo Finance as the data source (via yfinance).

app.py
app.py is the main Flask application. It defines all backend routes:
    ./ renders the main page "index.html".
    ./information renders a static page "information.html" containing information.
    ./search fetch company data, price history, metrics, price change, and news for the ticker symbol the user types.
    ./download generates and returns a CSV file with the historical price data for the company the user searched for.

Error handling is accounted for to prevent invalid searches or inputs.

data.py
data.py contains all logic for fetching data and how the data is processed. It is here we actually get our data from Yahoo Finance. It retrieves company metadata, valuation metrics, price history, market price, and news articles using yfinance. I have used functions to format large numbers, percentages, and float values to make the numbers more readable and clear. Yahoo Finance exposes different fields depending on whether the market is open or closed, meaning calculating intraday price change got quite tricky. But i made it work with some help from ChatGPT. This hurdle was overcome by adding fallback strategies to make sure price and price change data is returned whenever possible.

Separating data handling from route handling was a choice i made to keep things more organized when coding. It made it mentally more clear to me.

base.html
For the frontend i used a Jinja template "base.html" which defines the structure of the app, including a navigation bar, font import, footer, CSS and JavaScript dependencies. Both the main page and the information page extend this base template.

index.html & information.html
This is the main page where the search bar is located. Elements such as company description, price, chart, metrics, download option, and news are initially hidden and only revealed after a successful search. I made it this way to avoid meaningless clutter on the main page. The information page was made with the intention of describing the web app, and also provide some useful tips for searchable tickers. Especially tickers for a few indices as well as government bonds, as these can be a bit harder to remember than stock tickers. I also made it so the tickers in the table are clickable which will essentially search for that ticker.

main.js
All client-side behaviour is implemented in main.js. This file is responsible for sending search requests to the backend, processing JSON, and updating the DOM. Seperate rendering functions are used for company information, prices, charts, financial metrics, and news articles. Event listeners were implemented to make the app more keyboard friendly, allowing the user to search by pressing the enter key, and return to the homepage with the escape key. I also made sure all inputs for the historical price downloader must be satisfied before the user is able to click the download CSV button.

style.css
It is in style.css where the visual aspects of the application is decided. Overall i have gone for a dark theme with black background colours and orange as a secondary colour. This design choice was inspired by the Bloomberg terminal look and makes it seem familiar to someone who has experience with one.

In conclusion "Terminal." acts as a financial web application that integrates real-time data fetching, backend processing, frontend rendering, and user friendly interactive design. The application provides a solid foundation for future extensions with more functions. For now the application is usefull to retrieve data from which i can then import to Excel or R to continue my analysis and valuations.
