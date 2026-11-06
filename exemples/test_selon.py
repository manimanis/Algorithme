# ========================================================
# Programme transpilé depuis Algorithme : Exercice7
# Transpilateur Python avec NumPy et programmation structurée
# (Approche 1 pour Répéter..Jusqu'à : drapeau booléen)
# ========================================================

dt = ""
j = 0
m = 0
a = 0
j1 = 0
m1 = 0
a1 = 0
nbjour = 0

dt = input("La date d'aujourd'hui ?")
j = (float(dt[0:2]) if ('.' in dt[0:2] or 'e' in dt[0:2].lower()) else int(dt[0:2]))
m = (float(dt[3:5]) if ('.' in dt[3:5] or 'e' in dt[3:5].lower()) else int(dt[3:5]))
a = (float(dt[6:10]) if ('.' in dt[6:10] or 'e' in dt[6:10].lower()) else int(dt[6:10]))
j1 = j + 3
m1 = m
a1 = a
if m1 in {1, 3, 5, 7, 8, 10, 12}:
    nbjour = 31
elif m1 in {4, 6, 9, 11}:
    nbjour = 30
elif m1 == 2:
    nbjour = 28
    if a1 % 4 == 0:
        nbjour = 29
if j1 > nbjour:
    m1 = m1 + 1
    j1 = j1 - nbjour
if m1 > 12:
    m1 = 1
    a1 = a1 + 1
print(j1, "/", m1, "/", a1)
