# ========================================================
# Programme transpilé depuis Algorithme : TestEcrireEtCommentaires
# Transpilateur Python avec NumPy et programmation structurée
# (Approche 1 pour Répéter..Jusqu'à : drapeau booléen)
# ========================================================

def CalculerMoyenne(note1, note2):
    return ((note1 + note2) / 2)

m = 0.0
m1 = 0.0

m = CalculerMoyenne(15.5, 18.5)
m1 = CalculerMoyenne(16, 19)
print("--- Affichage standard ---")
print("Moyenne : ", m)
print("Moyenne 1 : ", m1)
print("--- Affichage avec séparateur personnalisé ---")
print("Tunisie", "Sousse", "Tunis", "Monastir", sep=" -> ")
print("--- Affichage avec sep et fin ---")
print(1, 2, 3, sep=" - ", end=" [Fin de liste]")
