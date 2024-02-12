

// ================ SECTION 1: Default values, data structures and related functions ================

function getDefaultMarketSymbol() {
  return "BTC-USDT";
}

function getCurrentMarketSymbol() {
  var currentMarketSymbol = document.getElementById("binanceMarket").innerText;
  return currentMarketSymbol;
}

function getDefaultTimeInterval() {
  return "1d";
}

function getCurrentTimeInterval() {
  var currentTimeIntervalText = document.getElementById("timeFrame").innerText;
  var currentTimeInterval = timeTextToCode(currentTimeIntervalText);
  return currentTimeInterval;
}

function getDefaultNumberOfDatasets() {
  return 150;
}

function getMaxNumberOfHighCaps() {
  return 20;
}

function getBaseCurrencies() {
  return ["BTC", "ETH", "USDT"];
}

function getSMAs() {
//This array of objects defines all SMAs.
  var SMAs = [{name:  "SMA20", value:  20, color: '#E74C3C'},
              {name:  "SMA50", value:  50, color: '#2471A3'},
              {name: "SMA100", value: 100, color: '#8E44AD'}];
  return SMAs;
}

function getTimeIntervals() {
//This array of objects defines all time intervals on Binance:
//name is for API calls and text is for time frames and buttons text.
  var timeIntervals = [{name:"1m", text:"1 min"},
                       {name:"3m", text:"3 min"},
                       {name:"5m", text:"5 min"},
                       {name:"15m", text:"15 min"},
                       {name:"30m", text:"30 min"},
                       {name:"1h", text:"1 hour"},
                       {name:"2h", text:"2 hours"},
                       {name:"4h", text:"4 hours"},
                       {name:"6h", text:"6 hours"},
                       {name:"8h", text:"8 hours"},
                       {name:"12h", text:"12 hours"},
                       {name:"1d", text:"1 day"},
                       {name:"3d", text:"3 days"},
                       {name:"1w", text:"1 week"},
                       {name:"1M", text:"1 month"}];
  return timeIntervals;
}

//Receives the name of a timeIntervals object and returns its text.
function timeCodeToText(timeInterval) {
  timeCodes = getTimeIntervals();
  for (var i = 0; i < timeCodes.length; i++) {
    if (timeInterval == timeCodes[i].name) {
      return timeCodes[i].text;
    }
  }
  return "No such interval code!";
}

//Receives the text of a timeIntervals object and returns its name.
function timeTextToCode(timeInterval) {
  timeCodes = getTimeIntervals();
  for (var i = 0; i < timeCodes.length; i++) {
    if (timeInterval == timeCodes[i].text) {
      return timeCodes[i].name;
    }
  }
  return "No such interval text!";
}

// ================ SECTION 2: Creating HTML content ================

//Creates the group of buttons for selecting different time frames
function createButtonGroup() {
  var arrButton = getTimeIntervals();
  for (var i = 0; i < arrButton.length; i++) {
    document.write("<button class=button id=\"interval_" + arrButton[i].name +
                   "\" onclick=\"callApiAndPlot(getCurrentMarketSymbol(), '"
                   + arrButton[i].name + "', numberOfDatasets)\">"
                   + arrButton[i].text + "</button>");
  }
}

// Creating the sliders for toggling the Simple Moving Averages (SMAs)
function createSliders() {
  var arrSMA = getSMAs();
  for (i = 0; i < arrSMA.length; i++) {
    var nameSMA = arrSMA[i].name;
    document.write("<th>");
    document.write("  <div class=\"toggle text\">");
    document.write("    <label class=\"checkbox-inline\">");
    document.write("      <span style=\"color:" + arrSMA[i].color + "\">" + nameSMA + "</span>");
    document.write("      <input id=\"" + nameSMA + "\" name=\"" + nameSMA + "\" type=\"checkbox\" checked>");
    document.write("      <span class=\"slider\"></span>");
    document.write("    </label>");
    document.write("  </div>");
    document.write("</th>");
  }
}

//Creating dummy drop down menus for base currencies, which are corrected later on.
function createDropDownMenus(baseCurrencies) {
  var j;
  for (j = 0; j < baseCurrencies.length; j++) {

      document.write("<div class=\"dropdown\">");
      document.write("  <button class=\"dropbtn\">" + baseCurrencies[j]);
      document.write("    <i class=\"fa fa-caret-down\"></i>");
      document.write("  </button>");
      document.write("  <div class=\"dropdown-content\">");
      var i;
      for (i = 0; i < getMaxNumberOfHighCaps(); i++) {
        document.write("<a id=\"" + baseCurrencies[j] + i + "\" " +
                       "onclick=setMarketSymbol(this.text+'-" + baseCurrencies[j] + "',getCurrentTimeInterval())" +
                       ">" + baseCurrencies[j] + i + "</a>");
      }
      document.write("  </div>");
      document.write("</div>");
  }
}

// ================ SECTION 3: API calls on Coinranking and Binance  ================

//Getting high market cap coins from Coinranking.
async function getHighCapCoins() {
  var api_url = 'https://api.coinranking.com/v1/public/coins?'
                + 'limit=' + getMaxNumberOfHighCaps();
  const response = await fetch(api_url);
  const apiData = await response.json();
  var highCapCoins = [];
  for (let i=0; i<apiData.data.coins.length; i++) {
    var currentSymbol = apiData.data.coins[i].symbol; //"MIOTA" is named "IOTA" on Binance
    (currentSymbol != "MIOTA" ? highCapCoins.push(currentSymbol) : highCapCoins.push("IOTA"));
  }
  return highCapCoins;
}

//Getting all available market pairs at Binance.
async function getBinanceMarketPairs() {
  var api_url = 'https://api.binance.com/api/v3/exchangeInfo';
  const response = await fetch(api_url);
  const apiData = await response.json();
  var binanceMarketPairs = [];
  for (let i=0; i<apiData.symbols.length; i++) {
     var currentSymbol = apiData.symbols[i].symbol;
     binanceMarketPairs.push(currentSymbol);
  }
  return binanceMarketPairs;
}

async function getKlines(marketSymbol, timeInterval, numberOfDatasets) {
  var api_url = 'https://api.binance.com/api/v3/klines?symbol=' + marketSymbol
                 + '&interval=' + timeInterval
                 + '&limit=' + numberOfDatasets;
  const response = await fetch(api_url);
  const apiData = await response.json();
  var timestamp = [];
  var openPrice = [];
  var highPrice = [];
  var lowPrice = [];
  var closePrice = [];
  for (var index in apiData){
    timestamp[index]  = new Date(apiData[index][0]);
    openPrice[index]  = apiData[index][1];
    highPrice[index]  = apiData[index][2];
    lowPrice[index]   = apiData[index][3];
    closePrice[index] = apiData[index][4];
  }
  updateTimeFrameText(timeInterval);
  return [timestamp, openPrice, highPrice, lowPrice, closePrice];
}

// ================ SECTION 4: Functions using the API calls  ================

//Correcting drop down menus or deleting menu entry if market pair is not available.
async function getDropDownMenu(baseCurrencies) {
  const binanceMarketPairs = await getBinanceMarketPairs();
  const highCapCoin = await getHighCapCoins();
  for (var j = 0; j < baseCurrencies.length; j++) {
    for (var i = 0; i < getMaxNumberOfHighCaps(); i++) {
      var parsedMarketSymbol = parseMarketSymbol(highCapCoin[i] + '-' + baseCurrencies[j]);
      if (binanceMarketPairs.includes(parsedMarketSymbol)) {
        $("#" + baseCurrencies[j] + i).text(highCapCoin[i]);
      }
      else {
        $("#" + baseCurrencies[j] + i).remove();
      }
    }
  }
}

//Getting the market data, calculating SMAs and calling makePlot function
async function callApiAndPlot(marketSymbol=getDefaultMarketSymbol(),
                              timeInterval=getDefaultTimeInterval(),
                              numberOfDatasets=getDefaultNumberOfDatasets()) {
  marketSymbol = parseMarketSymbol(marketSymbol, "");
  apiData = await getKlines(marketSymbol, timeInterval, numberOfDatasets);
  timestamp = apiData[0];
  openPrice = apiData[1];
  highPrice = apiData[2];
  lowPrice  = apiData[3];
  closePrice= apiData[4];
  var arrSMA = getSMAs();
  var dataSMA = [];
  var checkboxSMA = [];
  for (i = 0; i < arrSMA.length; i++) {
    //Calculating all SMAs
    dataSMA.push(calcSMA(timestamp, closePrice, arrSMA[i].value));
    //Getting states of the sliders (checkbuttons)
    checkboxSMA.push(document.getElementById(arrSMA[i].name).checked);
  }
  makePlot(timestamp, marketSymbol,
           openPrice, highPrice, lowPrice, closePrice,
           dataSMA, checkboxSMA);
}

//Update website content after choosing new market pair or new time interval
function setMarketSymbol(marketSymbol, timeInterval) {
  const marketSymbolText = parseMarketSymbol(marketSymbol, '-');
  $("#binanceMarket").text(marketSymbolText);
  updateTimeFrameText(timeInterval);
  callApiAndPlot(marketSymbol, timeInterval, numberOfDatasets);
}

// ================ SECTION 5: Functions for calculating the SMAs  ================

//Calculates the sum of the given array
function arraySum(arrSMA) {
  var arrLength = arrSMA.length;
  var sumOfArray = 0;
  while (arrLength--) {
    sumOfArray += Number(arrSMA[arrLength]);
  }
  return sumOfArray;
}

//Calculates the average of an array range
function calcAverage(arrSMA, index, range) {
  return arraySum(arrSMA.slice(index - range, index)) / range;
}

//Calculates Simple Moving Average (SMA)
function calcSMA(arrTime, arrSMA, range) {
  var result = [];
  var timestamps = [];
  var arrLength = arrSMA.length + 1;
  var index = range - 1;
  while (++index < arrLength) {
    result.push(calcAverage(arrSMA, index, range));
    timestamps.push(arrTime[index]);
  }
  return [timestamps, result];
}

// ================ SECTION 6: The makePlot function  ================

function makePlot(timestamp, marketSymbol,
                  openPrice, highPrice, lowPrice, closePrice,
                  dataSMA, checkboxSMA) {
  var trace1 = {
    x: timestamp,
    name : marketSymbol,
    close: closePrice,
    decreasing: {line: {color: '#FF1A1A'}},
    high: highPrice,
    increasing: {line: {color: '#77B41F'}},
    line: {color: 'rgba(31,119,180,1)'},
    low: lowPrice,
    open: openPrice,
        type: 'candlestick',
    xaxis: 'x',
    yaxis: 'y',
    showlegend: true
  };

  var arrSMA = getSMAs();
  var arrTrace = [];
  arrTrace.push(trace1);
  for (i = 0; i < dataSMA.length; i++) {
    var trace = {
      visible : checkboxSMA[i],
      name : arrSMA[i].name,
      x: dataSMA[i][0],
      y: dataSMA[i][1],
      type: 'scatter',
      line: {color: arrSMA[i].color}
    }
    arrTrace.push(trace);
  }

  var data = arrTrace;

  var layout = {
    dragmode: 'zoom',
    margin: {
      r: 10,
      t: 25,
      b: 40,
      l: 60
    },
    showlegend: true,
    xaxis: {
      autorange: true,
      domain: [0, 1],
      range: [],
      rangeslider: {range: []},
      title: 'Date',
      type: 'date'
    },
    yaxis: {
      autorange: true,
      domain: [0, 1],
      range: [],
      type: 'linear'
    }
  };
  var config = {responsive: true}
  Plotly.newPlot('myDiv', data, layout, config);
}

// ================ SECTION 7: Helper functions  ================

//Updating the time frame text in the header
function updateTimeFrameText(timeInterval) {
  const timeFrameText = timeCodeToText(timeInterval);
  $("#timeFrame").text(timeFrameText);
}

//The asset with the highest priority is always in the rear part.
//For example not USDTBTC, but BTCUSDT is the correct market pair.
function getPriority(currencyName) {
  switch (currencyName) {
  case "USDT":
    priority = 7;
    break;
  case "USDC":
    priority = 6;
    break;
  case "BTC":
    priority = 5;
    break;
  case "ETH":
    priority = 4;
    break;
  case "BNB":
    priority = 3;
    break;
  case "XRP":
    priority = 2;
    break;
  case "TRX":
    priority = 1;
    break;
  default:
    priority = 0;
  }
  return priority;
}

//This function returns a Binance market pair in the correct order.
function parseMarketSymbol(rawMarketSymbol, delimiter = "") {
  var quoteCurrency = {name:rawMarketSymbol.split('-')[0], priority:0};
  var baseCurrency  = {name:rawMarketSymbol.split('-')[1], priority:0};
  quoteCurrency.priority = getPriority(quoteCurrency.name);
  baseCurrency.priority  = getPriority(baseCurrency.name);
  if (quoteCurrency.priority > baseCurrency.priority) {
    return baseCurrency.name + delimiter + quoteCurrency.name;
  }
  else {
    return quoteCurrency.name + delimiter + baseCurrency.name;
  }
}

// ================ SECTION 8: Calling the functions  ================

//Correcting the dummy entries of the drop down menus
getDropDownMenu(getBaseCurrencies());

//Calling API and plotting with default values
callApiAndPlot(marketSymbol=getDefaultMarketSymbol(),
               timeInterval=getDefaultTimeInterval(),
               numberOfDatasets=getDefaultNumberOfDatasets());

// ===================> for Binance   
let allSymbolUSD = []
let allSymbolUSDT = []
let allSymbolBTC = []
var historyDataBinance = [];

// Dac Luu -->
async function getDataBarBinance() {
  delete allSymbolUSD;
  delete allSymbolUSDT;
  delete allSymbolBTC;
  delete historyDataBinance;

  deleteText("binanceCoin");
  var api_url = 'https://api.binance.com/api/v1/exchangeInfo'
  const response = await fetch(api_url);
  const apiData = await response.json();
  symbols = apiData.symbols;
  for( var i = 0; i < symbols.length; i++)
  {
    if(symbols[i].symbol.includes('USD'))
      allSymbolUSD.push(symbols[i].symbol);
    if(symbols[i].symbol.includes('USDT') && !symbols[i].symbol.includes('UPUSDT') && !symbols[i].symbol.includes('DOWNUSDT')
    &&  !symbols[i].symbol.includes('BEARUSD') && !symbols[i].symbol.includes('BULLUSD'))
      allSymbolUSDT.push(symbols[i].symbol);
    if(symbols[i].symbol.includes('BTC'))
      allSymbolBTC.push(symbols[i].symbol);
  }
  console.log('=============>>>>>>> All Binance USDT coins: ' + allSymbolUSDT);
  countBar = 0;
  maxBar = allSymbolUSDT.length;
  for (var i = 0; i < allSymbolUSDT.length; i++) {
    if(i > document.getElementById('limitSymbol').value ) break;
    var returnData = getBarInforBinance(allSymbolUSDT[i],document.getElementById('TimeFrameCheck').value,document.getElementById('numberOfBar').value);
    await sleep(document.getElementById('delayTime').value);
    // if(i>20) break;
  }
  console.log("=============>>>>>>> All Binance USDT coins collected!");

}
async function getBarInforBinance(marketSymbol, timeInterval, numberOfDatasets) {
  // console.log('==============> begin: ' + marketSymbol);
  var api_url = 'https://api.binance.com/api/v3/klines?symbol=' + marketSymbol
                 + '&interval=' + timeInterval
                 + '&limit=' + numberOfDatasets;
  const response = await fetch(api_url);
  const apiData = await response.json();
  historyDataBinance.push({apiData,marketSymbol});
  updateBarprogress();
}

function getDataBarHistorycalSavingBinance(){
  deleteText("binanceCoin");
  checkBox();
  console.log('=============>>>>>>> All Binance USDT coins: '+ ', total = ' +historyDataBinance.length + '-->' +historyDataBinance  );
  changeText("---> Start:",'binanceCoin');
  countBar = 0;
  maxBar = historyDataBinance.length;
  for(var i = 0; i <historyDataBinance.length; i++)
  {
    try
    {
      console.log("---> saved data: ("+ i + ") " + historyDataBinance[i].marketSymbol);//  + ': ' +historyDataMex[i].apiData.data );
    }catch (error) {
      console.error(error);
    }
  }
  
  for(var i = 0; i <historyDataBinance.length; i++)
  {
    try
    {
      HistorycalSavingBinance(historyDataBinance[i].apiData,historyDataBinance[i].marketSymbol);
    }catch (error) {
      console.error(error);
    }
  }
  changeText("---> End:",'binanceCoin');
}
function HistorycalSavingBinance(apiData,marketSymbol){
  var timestamp = [];
  var openPrice = [];
  var highPrice = [];
  var lowPrice = [];
  var closePrice = [];
  var volume = [];
  checkBox(); //updating checked box
  
  for (var index in apiData){
    timestamp[index]  = new Date(apiData[index][0]);
	// console.log("==== debug =======" + marketSymbol);
	// console.log(apiData[index]);
    openPrice[index]  = apiData[index][1];
    highPrice[index]  = apiData[index][2];
    lowPrice[index]   = apiData[index][3];
    closePrice[index] = apiData[index][4];
	  volume[index]     = apiData[index][5];
  }
  if(apiData.length > document.getElementById('numberMinOfBar').value && apiData.length < document.getElementById('numberMaxOfBar').value)
  {
    // console.log('Listed lower than 3 month: ' + marketSymbol + ', ' + apiData.length);
    var highes = parseFloat(highPrice[0]);
    var lowest = parseFloat(lowPrice[0]);
    var fibo_02 = 0.0;
    var fibo_03 = 0.0;
    var fibo_05 = 0.0;
    var sma20 = 0.0;
    var sma50 = 0.0;
    var smaV24 = 0.0;
	var smaV24_1 = 0.0;
	var smaV24_2 = 0.0;

    for(var i = 0; i < apiData.length; i++)
    {
      if(parseFloat(highPrice[i]) > highes)
        highes = parseFloat(highPrice[i]);
      if(parseFloat(lowPrice[i]) < lowest)
        lowest = parseFloat(lowPrice[i]);
      //console.log(i +': ' +  marketSymbol+', ' +timestamp[i] +', ' + openPrice[i]+', ' + closePrice[i]+', ' + highPrice[i]+', ' + lowPrice[i] +', ' + volume[i]);
    }
    // calculate fibo value
    fibo_02 = lowest + 0.236*(highes-lowest);
    fibo_03 = lowest + 0.382*(highes-lowest);
    fibo_05 = lowest + 0.5*(highes-lowest);
    // call culate SMA20 and SMA50
    var currentIndex = (apiData.length - 1);
    if(apiData.length > 20)
    {
      for(var i = currentIndex; i >  currentIndex - 20; i--)
      {
        sma20 = sma20 + parseFloat(closePrice[i]);
      }  
      sma20 = sma20/20;
    }
    if(apiData.length > 50)
    {
      for(var i = currentIndex; i >  currentIndex - 50; i--)
      {
        sma50 = sma50 + parseFloat(closePrice[i]);
      }  
      sma50 = sma50/50;
    }
    // ==============> define Fibo volume    
    //sma24 in volume
    if(apiData.length > 24)
    {
      for(var i = currentIndex; i >  currentIndex - 24; i--)
      {
        smaV24 = smaV24 + parseFloat(volume[i]);
      }  
      smaV24 = smaV24/24;
    }

    if(apiData.length > 25)
    {
      for(var i = currentIndex-1; i >  currentIndex - 25; i--)
      {
        smaV24_1 = smaV24_1 + parseFloat(volume[i]);
      }  
      smaV24_1 = smaV24_1/25;
    }
	
    if(apiData.length > 26)
    {
      for(var i = currentIndex-2; i >  currentIndex - 26; i--)
      {
        smaV24_2 = smaV24_2 + parseFloat(volume[i]);
      }  
      smaV24_2 = smaV24_2/26;
    }
	
    var ratioUltraVolume =      2.272;
    var ratioVeryHighVolume =   1.618;
    var ratioHighVolume =       1.272;
    var ratioNormalVolume =     0.786;
    var ratioLowVolume =        0.382;
    var ratioVeryLowVolume =    0.382;   
    
    var ultraHighVolumeMin   = smaV24 * ratioUltraVolume       ;
    var veryHighVolumeMin    = smaV24 * ratioVeryHighVolume    ;
    var highVolumeMin        = smaV24 * ratioHighVolume        ;
    var normalVolumeMin      = smaV24 * ratioNormalVolume      ;
    var lowVolumeMin         = smaV24 * ratioLowVolume         ;
    var veryLowVolumeMin     = smaV24 * ratioVeryLowVolume     ;
	
    var ultraHighVolumeMin1   = smaV24_1 * ratioUltraVolume       ;
    var veryHighVolumeMin1    = smaV24_1 * ratioVeryHighVolume    ;
    var highVolumeMin1        = smaV24_1 * ratioHighVolume        ;
    var normalVolumeMin1      = smaV24_1 * ratioNormalVolume      ;
    var lowVolumeMin1         = smaV24_1 * ratioLowVolume         ;
    var veryLowVolumeMin1     = smaV24_1 * ratioVeryLowVolume     ;

    var ultraHighVolumeMin2   = smaV24_2 * ratioUltraVolume       ;
    var veryHighVolumeMin2    = smaV24_2 * ratioVeryHighVolume    ;
    var highVolumeMin2        = smaV24_2 * ratioHighVolume        ;
    var normalVolumeMin2      = smaV24_2 * ratioNormalVolume      ;
    var lowVolumeMin2         = smaV24_2 * ratioLowVolume         ;
    var veryLowVolumeMin2     = smaV24_2 * ratioVeryLowVolume     ;	
    
    var vol  = parseFloat(volume[currentIndex])   ;
    var vol1 = parseFloat(volume[currentIndex-1]) ;
    var vol2 = parseFloat(volume[currentIndex-2]) ;

    var cap  = parseInt((parseFloat(volume[currentIndex])   * parseFloat(closePrice[currentIndex])  )/1000000);
    var cap1 = parseInt((parseFloat(volume[currentIndex-1]) * parseFloat(closePrice[currentIndex-1]))/1000000);
    var cap2 = parseInt((parseFloat(volume[currentIndex-2]) * parseFloat(closePrice[currentIndex-2]))/1000000);
	
    var is_volUltraHigh        = vol >= ultraHighVolumeMin                                     ;
    var is_volVeryHigh         = vol >= veryHighVolumeMin   && vol < ultraHighVolumeMin     ;
    var is_volHigh             = vol >= highVolumeMin       && vol < veryHighVolumeMin      ;
    var is_volNormal           = vol >= normalVolumeMin     && vol < highVolumeMin          ;
    var is_volLow              = vol >= lowVolumeMin        && vol < normalVolumeMin        ;
    var is_volVeryLow          = vol < lowVolumeMin   										  ;  

    var is_volUltraHigh1        = vol1 >= ultraHighVolumeMin1                                     ;
    var is_volVeryHigh1         = vol1 >= veryHighVolumeMin1   && vol1 < ultraHighVolumeMin1     ;
    var is_volHigh1             = vol1 >= highVolumeMin1       && vol1 < veryHighVolumeMin1      ;
    var is_volNormal1           = vol1 >= normalVolumeMin1     && vol1 < highVolumeMin1          ;
    var is_volLow1              = vol1 >= lowVolumeMin1        && vol1 < normalVolumeMin1        ;
    var is_volVeryLow1          = vol1 < lowVolumeMin1   										  ; 

    var is_volUltraHigh2        = vol2 >= ultraHighVolumeMin2                                     ;
    var is_volVeryHigh2         = vol2 >= veryHighVolumeMin2   && vol2 < ultraHighVolumeMin2     ;
    var is_volHigh2             = vol2 >= highVolumeMin2       && vol2 < veryHighVolumeMin2      ;
    var is_volNormal2           = vol2 >= normalVolumeMin2     && vol2 < highVolumeMin2          ;
    var is_volLow2              = vol2 >= lowVolumeMin2        && vol2 < normalVolumeMin2        ;
    var is_volVeryLow2          = vol2 < lowVolumeMin2   										  ; 
	
    //===================== end
    //check data    
    var c = closePrice[currentIndex];
    var leng = apiData.length;
    // console.log(marketSymbol + ": " + smaV24 + ", " + vol);
    if(document.getElementById('Bar0').checked)
    {
      if(isRatioUltraVolume   && is_volUltraHigh) changeText(leng +  '\t [Bar 0] [Ultra]'  + '\t' + '[' + cap + 'M $]'  + '\t'+ marketSymbol,'binanceCoin');
      if(isRatioVeryHighVolume&& is_volVeryHigh ) changeText(leng +  '\t [Bar 0] [Very H]' + '\t' + '[' + cap + 'M $]'  + '\t'+ marketSymbol,'binanceCoin');
      if(isRatioHighVolume    && is_volHigh     ) changeText(leng +  '\t [Bar 0] [High]'   + '\t' + '[' + cap + 'M $]'  + '\t'+ marketSymbol,'binanceCoin');
      if(isRatioNormalVolume  && is_volNormal   ) changeText(leng +  '\t [Bar 0] [Normal]' + '\t' + '[' + cap + 'M $]'  + '\t'+ marketSymbol,'binanceCoin');
      if(isRatioLowVolume     && is_volLow      ) changeText(leng +  '\t [Bar 0] [Low]'    + '\t' + '[' + cap + 'M $]'  + '\t'+ marketSymbol,'binanceCoin');
      if(isRatioVeryLowVolume && is_volVeryLow  ) changeText(leng +  '\t [Bar 0] [Very L]' + '\t' + '[' + cap + 'M $]'  + '\t'+ marketSymbol,'binanceCoin');
    }
    if(document.getElementById('Bar1').checked)
    {    
      if(isRatioUltraVolume   && is_volUltraHigh1) changeText(leng + '\t [Bar 1] [Ultra]'  + '\t' + '[' + cap1 + 'M $]'  + '\t'+ marketSymbol,'binanceCoin');
      if(isRatioVeryHighVolume&& is_volVeryHigh1 ) changeText(leng + '\t [Bar 1] [Very H]' + '\t' + '[' + cap1 + 'M $]'  + '\t'+ marketSymbol,'binanceCoin');
      if(isRatioHighVolume    && is_volHigh1     ) changeText(leng + '\t [Bar 1] [High]'   + '\t' + '[' + cap1 + 'M $]'  + '\t'+ marketSymbol,'binanceCoin');
      if(isRatioNormalVolume  && is_volNormal1   ) changeText(leng + '\t [Bar 1] [Normal]' + '\t' + '[' + cap1 + 'M $]'  + '\t'+ marketSymbol,'binanceCoin');
      if(isRatioLowVolume     && is_volLow1      ) changeText(leng + '\t [Bar 1] [Low]'    + '\t' + '[' + cap1 + 'M $]'  + '\t'+ marketSymbol,'binanceCoin');
      if(isRatioVeryLowVolume && is_volVeryLow1  ) changeText(leng + '\t [Bar 1] [Very L]' + '\t' + '[' + cap1 + 'M $]'  + '\t'+ marketSymbol,'binanceCoin');
    }
    if(document.getElementById('Bar2').checked)
    {    
      if(isRatioUltraVolume   && is_volUltraHigh2) changeText(leng + '\t [Bar 2] [Ultra]'  + '\t' + '[' + cap2 + 'M $]' + '\t'+ marketSymbol,'binanceCoin');
      if(isRatioVeryHighVolume&& is_volVeryHigh2 ) changeText(leng + '\t [Bar 2] [Very H]' + '\t' + '[' + cap2 + 'M $]' + '\t'+ marketSymbol,'binanceCoin');
      if(isRatioHighVolume    && is_volHigh2     ) changeText(leng + '\t [Bar 2] [High]'   + '\t' + '[' + cap2 + 'M $]' + '\t'+ marketSymbol,'binanceCoin');
      if(isRatioNormalVolume  && is_volNormal2   ) changeText(leng + '\t [Bar 2] [Normal]' + '\t' + '[' + cap2 + 'M $]' + '\t'+ marketSymbol,'binanceCoin');
      if(isRatioLowVolume     && is_volLow2      ) changeText(leng + '\t [Bar 2] [Low]'    + '\t' + '[' + cap2 + 'M $]' + '\t'+ marketSymbol,'binanceCoin');
      if(isRatioVeryLowVolume && is_volVeryLow2  ) changeText(leng + '\t [Bar 2] [Very L]' + '\t' + '[' + cap2 + 'M $]' + '\t'+ marketSymbol,'binanceCoin');
    }
    if(isF02 && c < fibo_02)
    {
      if(!isOverSMA20 && !isOverSMA50 && ! isBetweenSMA20andSMA50 && ! isBetweenSMA50andSAM20 && ! isOverSMA20andSMA50 && !isLowerSMA20andSMA50)
        changeText(leng + '\t [< 0.2]' + ' \t  '+ marketSymbol,'binanceCoin');
      if(isOverSMA20 && c > sma20 && sma20 != 0.0)
        changeText(leng+ '\t [< 0.2]--[> sma20]' + ' \t  '+ marketSymbol,'binanceCoin');
      if(isOverSMA50 && c > sma50 && sma50 != 0.0)
        changeText(leng+ '\t [< 0.2]--[> sma50]' + ' \t  '+ marketSymbol,'binanceCoin');
      if(isBetweenSMA20andSMA50 && c > sma20 && c < sma50 && sma20 != 0.0 && sma50 != 0.0)
        changeText(leng+ '\t [< 0.2]--[sma20 - sma50]' + ' \t  '+ marketSymbol,'binanceCoin');
      if(isBetweenSMA50andSAM20 && c < sma20 && c > sma50 && sma20 != 0.0 && sma50 != 0.0)
        changeText(leng+ '\t [< 0.2]--[sma50 - sma20]' + ' \t  '+ marketSymbol,'binanceCoin');
      if(isOverSMA20andSMA50 && c > sma20 && c > sma50 && sma20 != 0.0 && sma50 != 0.0) 
        changeText(leng+ '\t [< 0.2]--[> sma20,sma50]' + ' \t  '+ marketSymbol,'binanceCoin');
      if(isLowerSMA20andSMA50 && c < sma20 && c < sma50 && sma20 != 0.0 && sma50 != 0.0)
        changeText(leng+ '\t [< 0.2]--[< sma20,sma50]' + ' \t  '+ marketSymbol,'binanceCoin');
    }
    if(isF03 && c < fibo_03 && c > fibo_02)
    {
      if(!isOverSMA20 && !isOverSMA50 && ! isBetweenSMA20andSMA50 && ! isBetweenSMA50andSAM20 && ! isOverSMA20andSMA50 && !isLowerSMA20andSMA50)
        changeText(leng + '\t [< 0.3]' + ' \t  '+ marketSymbol,'binanceCoin');
      if(isOverSMA20 && c > sma20 && sma20 != 0.0)
        changeText(leng+ '\t [< 0.3]--[> sma20]' + ' \t  '+ marketSymbol,'binanceCoin');
      if(isOverSMA50 && c > sma50 && sma50 != 0.0)
        changeText(leng+ '\t [< 0.3]--[> sma50]' + ' \t  '+ marketSymbol,'binanceCoin');
      if(isBetweenSMA20andSMA50 && c > sma20 && c < sma50  && sma20 != 0.0 && sma50 != 0.0)
        changeText(leng+ '\t [< 0.3]--[sma20 - sma50]' + ' \t  '+ marketSymbol,'binanceCoin');
      if(isBetweenSMA50andSAM20 && c < sma20 && c > sma50 && sma20 != 0.0 && sma50 != 0.0 )
        changeText(leng+ '\t [< 0.3]--[sma50 - sma20]' + ' \t  '+ marketSymbol,'binanceCoin');
      if(isOverSMA20andSMA50 && c > sma20 && c > sma50 && sma20 != 0.0 && sma50 != 0.0) 
        changeText(leng+ '\t [< 0.3]--[> sma20,sma50]' + ' \t  '+ marketSymbol,'binanceCoin');
      if(isLowerSMA20andSMA50 && c < sma20 && c < sma50 && sma20 != 0.0 && sma50 != 0.0)
        changeText(leng+ '\t [< 0.3]--[< sma20,sma50]' + ' \t  '+ marketSymbol,'binanceCoin');
    }
    if(isF05 && c < fibo_05 && c > fibo_03 && c > fibo_02)
    {
      if(!isOverSMA20 && !isOverSMA50 && ! isBetweenSMA20andSMA50 && ! isBetweenSMA50andSAM20 && ! isOverSMA20andSMA50 && !isLowerSMA20andSMA50)
        changeText(leng + '\t [< 0.5]' + ' \t  '+ marketSymbol,'binanceCoin');
      if(isOverSMA20 && c > sma20 && sma20 != 0.0)
        changeText(leng+ '\t [< 0.5]--[> sma20]' + ' \t  '+ marketSymbol,'binanceCoin');
      if(isOverSMA50 && c > sma50 && sma50 != 0.0)
        changeText(leng+ '\t [< 0.5]--[> sma50]' + ' \t  '+ marketSymbol,'binanceCoin');
      if(isBetweenSMA20andSMA50 && c > sma20 && c < sma50 && sma20 != 0.0 && sma50 != 0.0)
        changeText(leng+ '\t [< 0.5]--[sma20 - sma50]' + ' \t  '+ marketSymbol,'binanceCoin');
      if(isBetweenSMA50andSAM20 && c < sma20 && c > sma50 && sma20 != 0.0 && sma50 != 0.0)
        changeText(leng+ '\t [< 0.5]--[sma50 - sma20]' + ' \t  '+ marketSymbol,'binanceCoin');
      if(isOverSMA20andSMA50 && c > sma20 && c > sma50 && sma20 != 0.0 && sma50 != 0.0) 
        changeText(leng+ '\t [< 0.5]--[> sma20,sma50]' + ' \t  '+ marketSymbol,'binanceCoin');
      if(isLowerSMA20andSMA50 && c < sma20 && c < sma50 && sma20 != 0.0 && sma50 != 0.0)
        changeText(leng+ '\t [< 0.5]--[< sma20,sma50]' + ' \t  '+ marketSymbol,'binanceCoin');
    }
    if(c > fibo_02)
      console.log('Binance default > 0.2: ' +marketSymbol );
    else if(c > fibo_05)
      console.log('Binance default > 0.5: ' +marketSymbol );
  }
    // if(isF02 === false && isF03 === false && isF05 === false)
    // {
    //   if(c > fibo_05) changeText(leng+ '\t [> 0.5]' + ' \t  '+ marketSymbol,'binanceCoin');
    //   else changeText(leng+ '\t [< 0.5]' + ' \t  '+ marketSymbol,'binanceCoin');
    // }
    updateBarprogress();
}



function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
// ===============================================================================> for merc
let allSymbolUSD_mexc = []
let allSymbolUSDT_mexc = []
let allSymbolBTC_mexc = []
var countBar = 0;
var maxBar = 0;

async function getDataBarMexc() {
  delete allSymbolUSD_mexc;
  delete allSymbolUSDT_mexc;
  delete allSymbolBTC_mexc;
  delete historyDataMex;

  // var api_url = 'https://www.mexc.com/open/api/v2/market/api_default_symbols'
  var api_url = 'https://www.mexc.com/open/api/v2/market/symbols'
  const response = await fetch(api_url);
  const apiData = await response.json();
  symbols = apiData.data;

  for( var i = 0; i < symbols.length; i++)
  {
    if(i > document.getElementById('limitSymbol').value ) break;
    if(symbols[i].symbol.includes('USD') && !symbols[i].symbol.includes('3L_') && !symbols[i].symbol.includes('3S_'))
    {
      allSymbolUSDT_mexc.push(symbols[i].symbol);
    }
  }
  console.log('=============>>>>>>> All Mexc USDT coins: '+ ', total = ' +allSymbolUSDT_mexc.length + '-->' +allSymbolUSDT_mexc  );
  countBar = 0;
  maxBar = allSymbolUSDT_mexc.length;
  for (var i = 0; i < allSymbolUSDT_mexc.length; i++) {  
    var returnData = getBarInforMexc(allSymbolUSDT_mexc[i],document.getElementById('TimeFrameCheck').value,document.getElementById('numberOfBar').value);
    await sleep(document.getElementById('delayTime').value);
    // if(i>20) break;
  }
  console.log("=============>>>>>>> All Mexc USDT coins collected!");
}
var historyDataMex = [];
async function getBarInforMexc(marketSymbol, timeInterval, numberOfDatasets) {
  // console.log('==============> begin: ' + marketSymbol);
  var api_url = 'https://www.mexc.com/open/api/v2/market/kline?symbol=' + marketSymbol
                 + '&interval=' + timeInterval
                 + '&limit=' + numberOfDatasets;
  const response = await fetch(api_url);
  const apiData = await response.json();
  historyDataMex.push({apiData,marketSymbol});
  updateBarprogress();
}
function getDataBarHistorycalSavingMexc(){
  deleteText("mexcCoin");
  checkBox();
  console.log('=============>>>>>>> All Mexc USDT coins: '+ ', total = ' +allSymbolUSDT_mexc.length + '-->' +allSymbolUSDT_mexc  );
  changeText("---> Start:",'mexcCoin');
  countBar = 0;
  maxBar = allSymbolUSDT_mexc.length;
  for(var i = 0; i <historyDataMex.length; i++)
  {
    try
    {
      console.log("---> saved data: ("+ i + ") " + historyDataMex[i].marketSymbol);//  + ': ' +historyDataMex[i].apiData.data );
    }catch (error) {
      console.error(error);
    }
  }
  
  for(var i = 0; i <historyDataMex.length; i++)
  {
    try
    {
      HistorycalSavingMexc(historyDataMex[i].apiData,historyDataMex[i].marketSymbol);
    }catch (error) {
      console.error(error);
    }
  }
  changeText("---> End:",'mexcCoin');
}
function HistorycalSavingMexc(apiData,marketSymbol){
  var timestamp = [];
  var openPrice = [];
  var highPrice = [];
  var lowPrice = [];
  var closePrice = [];
  var volume = [];
  if(apiData.data.length < 1)
  return;

  for (var index = 0 ; index < apiData.data.length; index++){
    // timestamp[index]  = new Date(apiData[index][0]);
    openPrice[index]  = apiData.data[index][1];
    highPrice[index]  = apiData.data[index][3];
    lowPrice[index]   = apiData.data[index][4];
    closePrice[index] = apiData.data[index][2];
    volume[index]     = apiData.data[index][5];
  }

  var _length = apiData.data.length;
  if(_length > document.getElementById('numberMinOfBar').value && _length< document.getElementById('numberMaxOfBar').value)
  {
    // console.log('Listed lower than 3 month: ' + marketSymbol + ', ' + apiData.length);
    var highes = parseFloat(highPrice[0]);
    var lowest = parseFloat(lowPrice[0]);
    var fibo_02 = 0.0;
    var fibo_03 = 0.0;
    var fibo_05 = 0.0;
    var sma20 = 0.0;
    var sma50 = 0.0;
    var smaV24 = 0.0;
	  var smaV24_1 = 0.0;
	  var smaV24_2 = 0.0;

    for(var i = 0; i < _length; i++)
    {
      if(parseFloat(highPrice[i]) > highes)
        highes = parseFloat(highPrice[i]);
      if(parseFloat(lowPrice[i]) < lowest)
        lowest = parseFloat(lowPrice[i]);
      // console.log(i +': ' +  marketSymbol+', ' +timestamp[i] +', ' + openPrice[i]+', ' + closePrice[i]+', ' + highPrice[i]+', ' + lowPrice[i]);
    }
    // calculate fibo value
    fibo_02 = lowest + 0.236*(highes-lowest);
    fibo_03 = lowest + 0.382*(highes-lowest);
    fibo_05 = lowest + 0.5*(highes-lowest);
    // call culate SMA20
    var currentIndex = (_length - 1);
    if(_length > 20)
    {
      for(var i = currentIndex; i >  currentIndex - 20; i--)
      {
        sma20 = sma20 + parseFloat(closePrice[i]);
      }  
      sma20 = sma20/20;
    }
    if(_length > 50)
    {
      for(var i = currentIndex; i >  currentIndex - 50; i--)
      {
        sma50 = sma50 + parseFloat(closePrice[i]);
      }  
      sma50 = sma50/50;
    }


    // ==============> define Fibo volume    
    //sma24 in volume
    if(_length > 24)
    {
      for(var i = currentIndex; i >  currentIndex - 24; i--)
      {
        smaV24 = smaV24 + parseFloat(volume[i]);
      }  
      smaV24 = smaV24/24;
    }

    if(_length > 25)
    {
      for(var i = currentIndex-1; i >  currentIndex - 25; i--)
      {
        smaV24_1 = smaV24_1 + parseFloat(volume[i]);
      }  
      smaV24_1 = smaV24_1/25;
    }
	
    if(_length > 26)
    {
      for(var i = currentIndex-2; i >  currentIndex - 26; i--)
      {
        smaV24_2 = smaV24_2 + parseFloat(volume[i]);
      }  
      smaV24_2 = smaV24_2/26;
    }
	
    var ratioUltraVolume =      2.272;
    var ratioVeryHighVolume =   1.618;
    var ratioHighVolume =       1.272;
    var ratioNormalVolume =     0.786;
    var ratioLowVolume =        0.382;
    var ratioVeryLowVolume =    0.382;   
    
    var ultraHighVolumeMin   = smaV24 * ratioUltraVolume       ;
    var veryHighVolumeMin    = smaV24 * ratioVeryHighVolume    ;
    var highVolumeMin        = smaV24 * ratioHighVolume        ;
    var normalVolumeMin      = smaV24 * ratioNormalVolume      ;
    var lowVolumeMin         = smaV24 * ratioLowVolume         ;
    var veryLowVolumeMin     = smaV24 * ratioVeryLowVolume     ;
	
    var ultraHighVolumeMin1   = smaV24_1 * ratioUltraVolume       ;
    var veryHighVolumeMin1    = smaV24_1 * ratioVeryHighVolume    ;
    var highVolumeMin1        = smaV24_1 * ratioHighVolume        ;
    var normalVolumeMin1      = smaV24_1 * ratioNormalVolume      ;
    var lowVolumeMin1         = smaV24_1 * ratioLowVolume         ;
    var veryLowVolumeMin1     = smaV24_1 * ratioVeryLowVolume     ;

    var ultraHighVolumeMin2   = smaV24_2 * ratioUltraVolume       ;
    var veryHighVolumeMin2    = smaV24_2 * ratioVeryHighVolume    ;
    var highVolumeMin2        = smaV24_2 * ratioHighVolume        ;
    var normalVolumeMin2      = smaV24_2 * ratioNormalVolume      ;
    var lowVolumeMin2         = smaV24_2 * ratioLowVolume         ;
    var veryLowVolumeMin2     = smaV24_2 * ratioVeryLowVolume     ;	
    
    var vol  = parseFloat(volume[currentIndex])   ;
    var vol1 = parseFloat(volume[currentIndex-1]) ;
    var vol2 = parseFloat(volume[currentIndex-2]) ;

    var cap  = parseInt((parseFloat(volume[currentIndex])   * parseFloat(closePrice[currentIndex])  )/1000000);
    var cap1 = parseInt((parseFloat(volume[currentIndex-1]) * parseFloat(closePrice[currentIndex-1]))/1000000);
    var cap2 = parseInt((parseFloat(volume[currentIndex-2]) * parseFloat(closePrice[currentIndex-2]))/1000000);
	
    var is_volUltraHigh        = vol >= ultraHighVolumeMin                                     ;
    var is_volVeryHigh         = vol >= veryHighVolumeMin   && vol < ultraHighVolumeMin     ;
    var is_volHigh             = vol >= highVolumeMin       && vol < veryHighVolumeMin      ;
    var is_volNormal           = vol >= normalVolumeMin     && vol < highVolumeMin          ;
    var is_volLow              = vol >= lowVolumeMin        && vol < normalVolumeMin        ;
    var is_volVeryLow          = vol < lowVolumeMin   										  ;  

    var is_volUltraHigh1        = vol1 >= ultraHighVolumeMin1                                     ;
    var is_volVeryHigh1         = vol1 >= veryHighVolumeMin1   && vol1 < ultraHighVolumeMin1     ;
    var is_volHigh1             = vol1 >= highVolumeMin1       && vol1 < veryHighVolumeMin1      ;
    var is_volNormal1           = vol1 >= normalVolumeMin1     && vol1 < highVolumeMin1          ;
    var is_volLow1              = vol1 >= lowVolumeMin1        && vol1 < normalVolumeMin1        ;
    var is_volVeryLow1          = vol1 < lowVolumeMin1   										  ; 

    var is_volUltraHigh2        = vol2 >= ultraHighVolumeMin2                                     ;
    var is_volVeryHigh2         = vol2 >= veryHighVolumeMin2   && vol2 < ultraHighVolumeMin2     ;
    var is_volHigh2             = vol2 >= highVolumeMin2       && vol2 < veryHighVolumeMin2      ;
    var is_volNormal2           = vol2 >= normalVolumeMin2     && vol2 < highVolumeMin2          ;
    var is_volLow2              = vol2 >= lowVolumeMin2        && vol2 < normalVolumeMin2        ;
    var is_volVeryLow2          = vol2 < lowVolumeMin2   										  ; 
	
    //===================== end
    //check data    
    var c = closePrice[currentIndex];
    var leng = apiData.data.length;
    // console.log(marketSymbol + ": " + smaV24 + ", " + vol);
    if (marketSymbol.includes("_")) {
      // Xóa tất cả các dấu '_'
      marketSymbol = marketSymbol.replace(/_/g, "");
    }
    if(document.getElementById('Bar0').checked)
    {
      if(isRatioUltraVolume   && is_volUltraHigh) changeText(leng +  '\t [Bar 0] [Ultra]'  + '\t' + '[' + cap + 'M $]'  + '\t'+ marketSymbol,'mexcCoin');
      if(isRatioVeryHighVolume&& is_volVeryHigh ) changeText(leng +  '\t [Bar 0] [Very H]' + '\t' + '[' + cap + 'M $]'  + '\t'+ marketSymbol,'mexcCoin');
      if(isRatioHighVolume    && is_volHigh     ) changeText(leng +  '\t [Bar 0] [High]'   + '\t' + '[' + cap + 'M $]'  + '\t'+ marketSymbol,'mexcCoin');
      if(isRatioNormalVolume  && is_volNormal   ) changeText(leng +  '\t [Bar 0] [Normal]' + '\t' + '[' + cap + 'M $]'  + '\t'+ marketSymbol,'mexcCoin');
      if(isRatioLowVolume     && is_volLow      ) changeText(leng +  '\t [Bar 0] [Low]'    + '\t' + '[' + cap + 'M $]'  + '\t'+ marketSymbol,'mexcCoin');
      if(isRatioVeryLowVolume && is_volVeryLow  ) changeText(leng +  '\t [Bar 0] [Very L]' + '\t' + '[' + cap + 'M $]'  + '\t'+ marketSymbol,'mexcCoin');
    }
    if(document.getElementById('Bar1').checked)
    {    
      if(isRatioUltraVolume   && is_volUltraHigh1) changeText(leng + '\t [Bar 1] [Ultra]'  + '\t' + '[' + cap1 + 'M $]'  + '\t'+ marketSymbol,'mexcCoin');
      if(isRatioVeryHighVolume&& is_volVeryHigh1 ) changeText(leng + '\t [Bar 1] [Very H]' + '\t' + '[' + cap1 + 'M $]'  + '\t'+ marketSymbol,'mexcCoin');
      if(isRatioHighVolume    && is_volHigh1     ) changeText(leng + '\t [Bar 1] [High]'   + '\t' + '[' + cap1 + 'M $]'  + '\t'+ marketSymbol,'mexcCoin');
      if(isRatioNormalVolume  && is_volNormal1   ) changeText(leng + '\t [Bar 1] [Normal]' + '\t' + '[' + cap1 + 'M $]'  + '\t'+ marketSymbol,'mexcCoin');
      if(isRatioLowVolume     && is_volLow1      ) changeText(leng + '\t [Bar 1] [Low]'    + '\t' + '[' + cap1 + 'M $]'  + '\t'+ marketSymbol,'mexcCoin');
      if(isRatioVeryLowVolume && is_volVeryLow1  ) changeText(leng + '\t [Bar 1] [Very L]' + '\t' + '[' + cap1 + 'M $]'  + '\t'+ marketSymbol,'mexcCoin');
    }
    if(document.getElementById('Bar2').checked)
    {    
      if(isRatioUltraVolume   && is_volUltraHigh2) changeText(leng + '\t [Bar 2] [Ultra]'  + '\t' + '[' + cap2 + 'M $]' + '\t'+ marketSymbol,'mexcCoin');
      if(isRatioVeryHighVolume&& is_volVeryHigh2 ) changeText(leng + '\t [Bar 2] [Very H]' + '\t' + '[' + cap2 + 'M $]' + '\t'+ marketSymbol,'mexcCoin');
      if(isRatioHighVolume    && is_volHigh2     ) changeText(leng + '\t [Bar 2] [High]'   + '\t' + '[' + cap2 + 'M $]' + '\t'+ marketSymbol,'mexcCoin');
      if(isRatioNormalVolume  && is_volNormal2   ) changeText(leng + '\t [Bar 2] [Normal]' + '\t' + '[' + cap2 + 'M $]' + '\t'+ marketSymbol,'mexcCoin');
      if(isRatioLowVolume     && is_volLow2      ) changeText(leng + '\t [Bar 2] [Low]'    + '\t' + '[' + cap2 + 'M $]' + '\t'+ marketSymbol,'mexcCoin');
      if(isRatioVeryLowVolume && is_volVeryLow2  ) changeText(leng + '\t [Bar 2] [Very L]' + '\t' + '[' + cap2 + 'M $]' + '\t'+ marketSymbol,'mexcCoin');
    }    
    //check data    
    var c = closePrice[currentIndex];
    var leng = _length;

    if(isF02 && c < fibo_02)
    {
      if(!isOverSMA20 && !isOverSMA50 && ! isBetweenSMA20andSMA50 && ! isBetweenSMA50andSAM20 && ! isOverSMA20andSMA50 && !isLowerSMA20andSMA50)
        changeText(leng + '\t [< 0.2]' + ' \t  '+ marketSymbol,'mexcCoin');
      if(isOverSMA20 && c > sma20 && sma20 != 0.0)
        changeText(leng+ '\t [< 0.2]--[> sma20]' + ' \t  '+ marketSymbol,'mexcCoin');
      if(isOverSMA50 && c > sma50 && sma50 != 0.0)
        changeText(leng+ '\t [< 0.2]--[> sma50]' + ' \t  '+ marketSymbol,'mexcCoin');
      if(isBetweenSMA20andSMA50 && c > sma20 && c < sma50 && sma20 != 0.0 && sma50 != 0.0)
        changeText(leng+ '\t [< 0.2]--[sma20 - sma50]' + ' \t  '+ marketSymbol,'mexcCoin');
      if(isBetweenSMA50andSAM20 && c < sma20 && c > sma50 && sma20 != 0.0 && sma50 != 0.0)
        changeText(leng+ '\t [< 0.2]--[sma50 - sma20]' + ' \t  '+ marketSymbol,'mexcCoin');
      if(isOverSMA20andSMA50 && c > sma20 && c > sma50 && sma20 != 0.0 && sma50 != 0.0) 
        changeText(leng+ '\t [< 0.2]--[> sma20,sma50]' + ' \t  '+ marketSymbol,'mexcCoin');
      if(isLowerSMA20andSMA50 && c < sma20 && c < sma50 && sma20 != 0.0 && sma50 != 0.0)
        changeText(leng+ '\t [< 0.2]--[< sma20,sma50]' + ' \t  '+ marketSymbol,'mexcCoin');
    }
    if(isF03 && c < fibo_03 && c > fibo_02)
    {
      if(!isOverSMA20 && !isOverSMA50 && ! isBetweenSMA20andSMA50 && ! isBetweenSMA50andSAM20 && ! isOverSMA20andSMA50 && !isLowerSMA20andSMA50)
        changeText(leng + '\t [< 0.3]' + ' \t  '+ marketSymbol,'mexcCoin');
      if(isOverSMA20 && c > sma20 && sma20 != 0.0)
        changeText(leng+ '\t [< 0.3]--[> sma20]' + ' \t  '+ marketSymbol,'mexcCoin');
      if(isOverSMA50 && c > sma50 && sma50 != 0.0)
        changeText(leng+ '\t [< 0.3]--[> sma50]' + ' \t  '+ marketSymbol,'mexcCoin');
      if(isBetweenSMA20andSMA50 && c > sma20 && c < sma50  && sma20 != 0.0 && sma50 != 0.0)
        changeText(leng+ '\t [< 0.3]--[sma20 - sma50]' + ' \t  '+ marketSymbol,'mexcCoin');
      if(isBetweenSMA50andSAM20 && c < sma20 && c > sma50 && sma20 != 0.0 && sma50 != 0.0 )
        changeText(leng+ '\t [< 0.3]--[sma50 - sma20]' + ' \t  '+ marketSymbol,'mexcCoin');
      if(isOverSMA20andSMA50 && c > sma20 && c > sma50 && sma20 != 0.0 && sma50 != 0.0) 
        changeText(leng+ '\t [< 0.3]--[> sma20,sma50]' + ' \t  '+ marketSymbol,'mexcCoin');
      if(isLowerSMA20andSMA50 && c < sma20 && c < sma50 && sma20 != 0.0 && sma50 != 0.0)
        changeText(leng+ '\t [< 0.3]--[< sma20,sma50]' + ' \t  '+ marketSymbol,'mexcCoin');
    }
    if(isF05 && c < fibo_05 && c > fibo_03 && c > fibo_02)
    {
      if(!isOverSMA20 && !isOverSMA50 && ! isBetweenSMA20andSMA50 && ! isBetweenSMA50andSAM20 && ! isOverSMA20andSMA50 && !isLowerSMA20andSMA50)
        changeText(leng + '\t [< 0.5]' + ' \t  '+ marketSymbol,'mexcCoin');
      if(isOverSMA20 && c > sma20 && sma20 != 0.0)
        changeText(leng+ '\t [< 0.5]--[> sma20]' + ' \t  '+ marketSymbol,'mexcCoin');
      if(isOverSMA50 && c > sma50 && sma50 != 0.0)
        changeText(leng+ '\t [< 0.5]--[> sma50]' + ' \t  '+ marketSymbol,'mexcCoin');
      if(isBetweenSMA20andSMA50 && c > sma20 && c < sma50 && sma20 != 0.0 && sma50 != 0.0)
        changeText(leng+ '\t [< 0.5]--[sma20 - sma50]' + ' \t  '+ marketSymbol,'mexcCoin');
      if(isBetweenSMA50andSAM20 && c < sma20 && c > sma50 && sma20 != 0.0 && sma50 != 0.0)
        changeText(leng+ '\t [< 0.5]--[sma50 - sma20]' + ' \t  '+ marketSymbol,'mexcCoin');
      if(isOverSMA20andSMA50 && c > sma20 && c > sma50 && sma20 != 0.0 && sma50 != 0.0) 
        changeText(leng+ '\t [< 0.5]--[> sma20,sma50]' + ' \t  '+ marketSymbol,'mexcCoin');
      if(isLowerSMA20andSMA50 && c < sma20 && c < sma50 && sma20 != 0.0 && sma50 != 0.0)
        changeText(leng+ '\t [< 0.5]--[< sma20,sma50]' + ' \t  '+ marketSymbol,'mexcCoin');
    }
    if(c > fibo_05)
      ;
      // console.log('mexcCoin default > 0.5: ' +marketSymbol );
    }
    if(isF02 === false && isF03 === false && isF05 === false)
    {
      // if(c > fibo_05) changeText(leng+ '\t [> 0.5]' + ' \t  '+ marketSymbol,'mexcCoin');
      // else changeText(leng+ '\t [< 0.5]' + ' \t  '+ marketSymbol,'mexcCoin');
    }
    updateBarprogress();

}
// Dac Luu <--
function resetBarprogress()
{
  countBar = 0;
}
function updateBarprogress()
{
  countBar +=1;
  document.getElementById("progress").value = (countBar/maxBar)*100;
  document.getElementById('statusProgress').innerText = countBar + "/" + maxBar; 
}
function deleteText(id)
{
  var parElement = document.getElementById(id);
  parElement.innerHTML = '';
}
function changeText(text_in, id) {
    console.log(id + ": " + text_in);
    var node = document.createElement("LI");
    var textnode = document.createTextNode(text_in);
    node.appendChild(textnode);
    document.getElementById(id).appendChild(node);
}
//draw chart
async function  drawChartBinance()
{
  console.log(document.getElementById('symbolBinance').value+ ", " + document.getElementById('timeFrame').value);
  //Correcting the dummy entries of the drop down menus
  getDropDownMenu(getBaseCurrencies());

  //Calling API and plotting with default values
  var symbol = document.getElementById('symbolBinance').value
  // symbol.replace('USDT','-USDT')
  callApiAndPlot(symbol,
                document.getElementById('timeFrame').value,
                document.getElementById('numberOfBar').value);
}
async function  drawChartMexc()
{
  console.log(document.getElementById('symbolMexc').value+ ", " + document.getElementById('timeFrame').value);
}
var isF02 = false;
var isF03 = false;
var isF05 = false;
var isOverSMA20 = false;
var isOverSMA50 = false;
var isBetweenSMA20andSMA50 = false;
var isBetweenSMA50andSAM20 = false;
var isOverSMA20andSMA50 = false;
var isLowerSMA20andSMA50 = false;

var isRatioUltraVolume =      false;
var isRatioVeryHighVolume =   false;
var isRatioHighVolume =       false;
var isRatioNormalVolume =     false;
var isRatioLowVolume =        false;
var isRatioVeryLowVolume =    false; 

function checkBox()
{
  isF02 = false;
  isF03 = false;
  isF05 = false;
  isOverSMA20 = false;
  isOverSMA50 = false;
  isBetweenSMA20andSMA50 = false;
  isBetweenSMA50andSAM20 = false;
  isOverSMA20andSMA50 = false;
  isLowerSMA20andSMA50 = false;

  isRatioUltraVolume =      false;
  isRatioVeryHighVolume =   false;
  isRatioHighVolume =       false;
  isRatioNormalVolume =     false;
  isRatioLowVolume =        false;
  isRatioVeryLowVolume =    false; 

  if(document.getElementById('fibo02').checked) isF02= true;
  if(document.getElementById('fibo03').checked) isF03 = true;
  if(document.getElementById('fibo05').checked) isF05 = true;
  if(document.getElementById('sma20').checked) isOverSMA20 = true;
  if(document.getElementById('sma50').checked) isOverSMA50 = true;
  if(document.getElementById('lowerSMA50greaterSMA20').checked) isBetweenSMA20andSMA50 = true;
  if(document.getElementById('lowerSMA20greaterSMA50').checked) isBetweenSMA50andSAM20 = true;
  if(document.getElementById('greaterSMA20-50').checked) isOverSMA20andSMA50 = true;
  if(document.getElementById('lowerSMA20-50').checked) isLowerSMA20andSMA50 = true;
  if(document.getElementById('RatioUltraVolume').checked) isRatioUltraVolume   = true;
  if(document.getElementById('RatioVeryHighVolume').checked) isRatioVeryHighVolume = true;
  if(document.getElementById('RatioHighVolume').checked) isRatioHighVolume =    true;
  if(document.getElementById('RatioNormalVolume').checked) isRatioNormalVolume  = true;
  if(document.getElementById('RatioLowVolume').checked) isRatioLowVolume    = true;
  if(document.getElementById('RatioVeryLowVolume').checked) isRatioVeryLowVolume  = true;	  
  console.log("===> start check selected box");
  console.log(isF02);
  console.log(isF03 );
  console.log(isF05 );
  console.log(isOverSMA20 );
  console.log(isOverSMA50 );
  console.log(isBetweenSMA20andSMA50 );
  console.log(isBetweenSMA50andSAM20 );
  console.log(isOverSMA20andSMA50 );
  console.log(isLowerSMA20andSMA50 );
  console.log(isRatioUltraVolume   );
  console.log(isRatioVeryHighVolume);
  console.log(isRatioHighVolume    );
  console.log(isRatioNormalVolume  );
  console.log(isRatioLowVolume     );
  console.log(isRatioVeryLowVolume );  
  console.log("end check selected box <===");
}


function stream()
{
  let streams = [
    "ethbtc@miniTicker","bnbbtc@miniTicker","wavesbtc@miniTicker","bchabcbtc@miniTicker",
    "bchsvbtc@miniTicker","xrpbtc@miniTicker","tusdbtc@miniTicker","eosbtc@miniTicker",
    "trxbtc@miniTicker","ltcbtc@miniTicker","xlmbtc@miniTicker","bcptbtc@miniTicker",
    "adabtc@miniTicker","zilbtc@miniTicker","xmrbtc@miniTicker","stratbtc@miniTicker",
    "zecbtc@miniTicker","qkcbtc@miniTicker","neobtc@miniTicker","dashbtc@miniTicker","zrxbtc@miniTicker"
  ];

  let trackedStreams = [];

  //let ws = new WebSocket("wss://stream.binance.com:9443/ws/" + streams.join('/'));
  // https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=100
  // wss://stream.binance.com:9443/ws/ethusdt@trade
  let ws = new WebSocket("wss://stream.binance.com:9443/ws/ethusdt@kline_1d");

  ws.onopen = function() {
      console.log("Binance connected...");
  };

  ws.onmessage = function(evt) {
    // try {
    //   let msgs = JSON.parse(evt.data);
    //   if (Array.isArray(msgs)) {
    //     for (let msg of msgs) {
    //       handleMessage(msg);
    //     }
    //   } else {
    //     handleMessage(msgs)
    //   }
    // } catch (e) {
    //   console.log('Unknown message: ' + evt.data, e);
    // }
    console.log(evt.data);
    // ws.close();
  }

  ws.onclose = function() {
    console.log("Binance disconnected");
  }

}
function handleMessage(msg) {
  const stream = msg.s;
  if (trackedStreams.indexOf(stream) === -1) {
    document.getElementById('streams').innerHTML += '<br/>' + stream + ': <span id="stream_' + stream + '"></span>';
    trackedStreams.push(stream);
    document.getElementById('totalstreams').innerText = trackedStreams.length;
  }

  document.getElementById('stream_' + stream).innerText = msg.v;
}