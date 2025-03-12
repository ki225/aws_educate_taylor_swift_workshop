import pandas as pd
import numpy as np

# Read CSV file with encoding
df = pd.read_csv('src/dataset/Taylor_Train.csv', encoding='latin1')

# Display basic information about the data
print("Original data shape:", df.shape)
print("Original column names:", df.columns.tolist())

# Check missing values
print("\nMissing value count:")
print(df.isna().sum())

# Replace '' and special characters with NaN
df = df.replace(['', '\x97'], np.nan)

# Clean Attendance column - extract only the number of tickets sold
def clean_attendance(value):
    try:
        if pd.isna(value):
            return np.nan
        if '/' in str(value):
            return float(str(value).split('/')[0].strip().replace(',', ''))
        return value
    except:
        return np.nan

# Clean Revenue column - remove '$' and ',' 
def clean_revenue(value):
    try:
        if pd.isna(value):
            return np.nan
        if isinstance(value, str):
            return float(value.replace('$', '').replace(',', ''))
        return float(value)
    except:
        return np.nan

# Apply cleaning functions
df['Attendance'] = df['Attendance (tickets sold / available)'].apply(clean_attendance)
df['Revenue'] = df['Revenue'].apply(clean_revenue)

# Drop the original attendance column
df = df.drop('Attendance (tickets sold / available)', axis=1)

# Fill missing values with median for numerical columns
df['Attendance'] = df['Attendance'].fillna(df['Attendance'].median())
df['Revenue'] = df['Revenue'].fillna(df['Revenue'].median())

# For categorical columns, fill with mode
df['Opening act(s)'] = df['Opening act(s)'].fillna('No Opening Act')

# Create new features
# Extract year from tour name (assuming tour names contain year information)
df['Tour_Year'] = df['Tour'].map({
    'Fearless_Tour': 2009,
    'Speak_Now_World_Tour': 2011,
    'The_Red_Tour': 2013,
    'The_1989_World_Tour': 2015,
    'Reputation_Stadium_Tour': 2018
})

# Calculate revenue per attendee
df['Revenue_per_Attendee'] = df['Revenue'] / df['Attendance']

# Display cleaned data info
print("\nCleaned data info:")
print(df.info())

# Save cleaned dataset
df.to_csv('src/dataset/Taylor_Train_cleaned.csv', index=False, encoding='utf-8')
print("Data cleaning completed and saved to 'src/dataset/Taylor_Train_cleaned.csv'")

# Display summary statistics
print("\nSummary statistics:")
print(df.describe())
