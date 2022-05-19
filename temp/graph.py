import pandas as pd
import plotly.graph_objects as go


df = pd.read_csv('1.csv')

print(df["Valeur"][0])

fig = go.Figure(go.Scatter(y=df['Valeur'],mode='markers', name='signal'))

fig.update_layout(title="Test affichage", plot_bgcolor='rgb(230, 230,230)', showlegend=True)

fig.show()