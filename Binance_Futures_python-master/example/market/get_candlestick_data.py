from binance_f import RequestClient
from binance_f.model import *
from binance_f.constant.test import *
from binance_f.base.printobject import *
from data_price import *
import time
import pickle
from datetime import datetime
# import datetime

request_client = RequestClient(api_key=g_api_key, secret_key=g_secret_key)

def check_price(symbol,timeFrame, number_bar):
	result = request_client.get_candlestick_data(symbol=symbol, interval=timeFrame, 
												startTime=None, endTime=None, limit=number_bar)
	# ====> sample
	# PrintMix.print_data(result)
	# data number 16 :
	# close:303.440
	# closeTime:1625097599999
	# high:432.180
	# ignore:0
	# json_parse:<function Candlestick.json_parse at 0x000001D48768D4C0>
	# low:225.000
	# numTrades:68019857
	# open:353.140
	# openTime:1622505600000
	# quoteAssetVolume:54680396061.42096
	# takerBuyBaseAssetVolume:79988893.83
	# takerBuyQuoteAssetVolume:26905262737.19971
	# volume:162450916.59
	return result


def get_data_bar(symbol,time_frame,number_bar):
	candles = []
	result = check_price(symbol,time_frame,number_bar)
	# PrintMix.print_data(result) ##printall infor bar
	dict_price_bar['name'] = symbol
	dict_price_bar['frame'] = time_frame

	for idx, obj in enumerate(result):
		dict_price_bar.update(number = idx)
		members = [attr for attr in dir(obj) if not callable(attr) and not attr.startswith("__")]
		for member_def in members:
			val_str = str(getattr(obj, member_def))
			if(member_def == "close"):
				dict_price_bar['close'] = getattr(obj, member_def)
			elif(member_def == "open"):
				dict_price_bar['open'] = getattr(obj, member_def)
			elif(member_def == "high"):
				dict_price_bar['high'] = getattr(obj, member_def)
			elif(member_def == "low"):
				dict_price_bar['low'] = getattr(obj, member_def)
			elif(member_def == "openTime"):
				dict_price_bar['time'] = str(datetime.fromtimestamp(int(getattr(obj, member_def))/1000))
		t = dict_price_bar.copy()
		candles.append(t)
	return candles

def save_variable(in_):
	# Saving the objects:
	with open('log.pkl', 'wb') as f:
		pickle.dump(in_, f)

def restore_variable():
	# Getting back the objects:
	with open('log.pkl','rb') as f:
		a = pickle.load(f)
		return a

def get_data(sym,times):
	expected = []
	# for symbol in coin_binance_usdt:
	for symbol in sym:
		for time in times:
			try:
				BTC_D_bar = get_data_bar(str(symbol),time,200) #200 bars
				t = BTC_D_bar.copy()
				# expected.append(t)
				target = str(symbol) + "_" + str(time)
				eval(target).extend(t)
			except:
				print(" ==============> not data: " +  str(symbol) + "_" + str(time) )

def delete(sym, times):
	for symbol in sym:
		for time in times:
			target = str(symbol) + "_" + str(time)
			eval(target).clear()

def SMA(self, length):
	if(len(self) < length):
		return 0
	for i in range(len(self) - 1, length-1, -1):
		sum = 0
		for j in range(i,i - length, -1):
			sum += float(self[j]["close"])
		#update data sma
		if(length == 21):
			self[i]["ma21"] = sum/length
		elif(length == 50):
			self[i]["ma50"] = sum/length
		else:
			print(sum/length)


def update_status_down_up(sym,times):
	for symbol in sym:
		for time in times:
			target = str(symbol) + "_" + str(time)
			SMA(eval(target), 21)
			SMA(eval(target), 50)
			for i in eval(target):
				#down at MA21
				if((float(i["close"]) < float(i["ma21"]) and float(i["open"]) > float(i["ma21"])) and i["ma21"] != 0):
					if(float(i["close"]) <= float(i["ma50"])):
						i["status"] = "Down MA21 __ < MA50"
					else:
						i["status"] = "Down MA21 __ > MA50"
					eval(target + "_down").append(i)
				#up at MA21
				elif((float(i["close"]) > float(i["ma21"]) and float(i["open"]) < float(i["ma21"])) and i["ma21"] != 0):
					if(float(i["close"]) <= float(i["ma50"])):
						i["status"] = "Up MA21 __ < MA50"
					else:
						i["status"] = "Up MA21 __ > MA50"
					eval(target + "_up").append(i)


def print_newest(sym, times):
	save_file = []
	for symbol in sym:
		for time in times:
			target = str(symbol) + "_" + str(time)
			len_up = len(eval(target + "_up"))
			len_down = len(eval(target + "_down"))
			print("----------------: " + time)
			# current_day = str(datetime.datetime.now()).split(" ")[0]
			# crurrent_time = str(datetime.datetime.now()).split(" ")[1].split(".")[0]
			if(len_up > 0):
				# print(eval(target + "_up")[-1])
				# save_file.append(eval(target + "_up")[-1])
				for auto in eval(target + "_up"):
					# if(current_day in auto):
					# 	print(auto)
						save_file.append(auto)
			if(len_down > 0):
				# print(eval(target + "_down")[-1])
				# save_file.append(eval(target + "_down")[-1])
				for auto in eval(target + "_down"):
					# if(current_day in auto):
					# 	print(auto)
						save_file.append(auto)
	return save_file

def save_file(self):
	file_ = open("log.txt","w")
	for i in self:
		file_.writelines(str(i) + '\n')
	file_.close()
	save_variable(self)

# coin_binance_usdt #
syms = coin_binance_usdt # ["BTCUSDT","ETHUSDT","BNBUSDT"]
times = ["1h", "4h", "1d", "1w"]

delete(syms, times)
get_data(syms, times)
update_status_down_up(syms, times)
save_files = print_newest(syms,times)
save_file(save_files)
# expected = restore_variable()
# for i in expected:
# 	for j in i:
# 		print(j)