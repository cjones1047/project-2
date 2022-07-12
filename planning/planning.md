## App Concept
- App will be a toolbox for anyone who wants to research what stocks to buy in the stock market
    - Many apps to assist with stock-picking exist like this one today, but this one will have more character by lightly nudging a user towards a time-tested approach to stock-picking called "value-investing"
    - Will be almost entirely quantitative with a major focus on how any given company in the stock market has historically behaved based on its financial statements. 
    - The only qualitative bits of information will be a description of how a company makes its money
        - This description will be taken directly from the business summary section of the company's most recent 10-K

## Theme
- THEME WILL BE BLACK AND WHITE WITH GRAYSCALE AND ONLY ONE COLOR IS GOING TO BE ALLOWED IN THE ENTIRE APP
    - Only color allowed will be some form of light blue
    - I am NOT getting caught up in making this look as pretty as possible.
    - I feel as though endless style tweaking is a rabbit hole I went down on my last project which negatively affected functionality
    - I need this to work smoothely and have complete functionality, which will be quite a stretch in and of itself

 ## Layout   
- App's title at top of navbar oriented down the left-hand side of the screen
- Navbar is oriented down the left-hand side of the page so that each element can be more explicitly named and have it's own row
    - Navbar will also be collapsible at any given point in time
    - Navbar being optionally collapsible as an option promotes a full-screen viewing experience especially useful in viewing spreadsheets that hold years of annual report information on any given company
![general page layout](/planning/wireframes/expanded-menu.png)
![general page layout](/planning/wireframes/collapsed.png)
- Navbar items (when on any given page, that page's respective menu hyperlink will be light blue):
    - [Insert App's Title]
    - More about our way
        - "We don't look at stocks like some hot commodity to swap back and forth for an adrenaline rush because they've had some crazy price changes lately. A stock is just a slice of the pie, the entire company being the whole pie. So for starters, just remember that any time we're buying a stock we're behaving as though we want to buy the entire business.
        - Now imagine you want to buy a lemonade stand, a business that has to make a profit to stick around. How would you know what a fair price is for that business? You base your decision on how much money it usually makes on any given year. Since some businesses are seasonal, looking at profit numbers on a yearly basis ensures that you will never be overvaluing a summer business (like an ice cream truck) because it's been hot lately or a winter business (like snow-shoveling) because we just had a blizzard.
        - So now the next question you might be asking yourself is , "Ok, well how many years of profit is a business worth?" A good number is 8 times a companies usual profit on any given year. This effective strategy covers you in two ways. By default you won't be buying into companies that haven't actually been making money. You also won't get reamed by somebody trying to get you to overpay for their business.
        - This last part is the icing on the cake (or pie, or whatever). What if you have 20 lemonade stands all willing to sell you their entire company for less than 8 years of their profits and you could only afford to buy 5 of them? Well, you just pick the top 5 that give you the most bang for your buck. More specifically, buy the 5 giving you the most profit for every dollar you pay. This process of buying 5 profitable companies that are all on sale for a great price is what's called "diversification". Basically, if one of the companies has a run of bad luck you still got 4 great ones to more than cover you.
        - We hope you enjoy using the tools in [insert App Name] to help you find those 5 great businesses to build your financial future on. Happy hunting.
        - Casey Jones"
        ![](/planning/wireframes/our-way.png)
    - My Stocks [only shows up after user logs in, otherwise shows default "seed" stocks that we recommend]
        - Each stock will show up as a bootstrapped card with the name of a company, the company's logo (if available), a short decription of a company (only a sentence or two), and a button that says "View" which will submit a get request for a "show" (show.liquid) page
        ![](/planning/wireframes/my-stocks.png)
        - Show page ...
    - Search any stock
    - Backtesting
    - [login status]
        - if not logged in, will show "Log In" followed by "Sign Up" to give new users a chance to sign up and give old users a chance to log back in
        - if logged in, will just show the user's username
- Stretch goals
    - Have a stock price chart provide a render animation over the backtesting time period selected

