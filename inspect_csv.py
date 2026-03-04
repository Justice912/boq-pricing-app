import pandas as pd

df = pd.read_csv("Rate_Library.csv")

print("=== RAW CSV HEADERS ===")
for col in df.columns:
    print(repr(col))

print("\n=== FIRST ROW VALUES ===")
first = df.iloc[0]
for col in df.columns:
    print(f"{repr(col)} -> {repr(first[col])}")