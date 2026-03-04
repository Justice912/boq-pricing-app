import pandas as pd

def import_boq(file):
    if file.name.endswith(".csv"):
        df = pd.read_csv(file)
    else:
        df = pd.read_excel(file)

    df = df.fillna(0)
    return df.to_dict(orient="records")

def export_boq(data, currency):
    df = pd.DataFrame(data)
    filename = f"Priced_BoQ_{currency}.xlsx"
    df.to_excel(filename, index=False)
    return filename