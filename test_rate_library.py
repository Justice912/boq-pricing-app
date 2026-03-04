from rate_library import RATE_LIBRARY

print("Total rate items:", len(RATE_LIBRARY))

first_key = list(RATE_LIBRARY.keys())[0]
print("First RateItemID:", first_key)

rate = RATE_LIBRARY[first_key]

print("Description:", rate["Description"])
print("Materials_Rate_U:", rate["Materials_Rate_U"], type(rate["Materials_Rate_U"]))
print("Equipment_Rate_U:", rate["Equipment_Rate_U"], type(rate["Equipment_Rate_U"]))
print("Subcontract_Rate_U:", rate["Subcontract_Rate_U"], type(rate["Subcontract_Rate_U"]))
print("Overheads_pct_default:", rate["Overheads_pct_default"])
print("Markup_pct_default:", rate["Markup_pct_default"])