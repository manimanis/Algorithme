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

print("La date d'aujourd'hui ?")
dt = input()
j = (float(str(dt)[0:2]) if ('.' in str(str(dt)[0:2]) or 'e' in str(str(dt)[0:2]).lower()) else int(str(dt)[0:2]))
m = (float(str(dt)[3:5]) if ('.' in str(str(dt)[3:5]) or 'e' in str(str(dt)[3:5]).lower()) else int(str(dt)[3:5]))
a = (float(str(dt)[6:10]) if ('.' in str(str(dt)[6:10]) or 'e' in str(str(dt)[6:10]).lower()) else int(str(dt)[6:10]))
j1 = (j + 3)
m1 = m
a1 = a
if (m1 == 1) or (m1 == 3) or (m1 == 5) or (m1 == 7) or (m1 == 8) or (m1 == 10) or (m1 == 12) or (m1 == 1) or (m1 == 3) or (m1 == 5) or (m1 == 7) or (m1 == 8) or (m1 == 10) or (m1 == 12):
    nbjour = 31
elif (m1 == 4) or (m1 == 6) or (m1 == 9) or (m1 == 11) or (m1 == 4) or (m1 == 6) or (m1 == 9) or (m1 == 11):
    nbjour = 30
elif (m1 == 2) or (m1 == 2):
    nbjour = 28
    if ((a1 % 4) == 0):
        nbjour = 29
if (j1 > nbjour):
    m1 = (m1 + 1)
    j1 = (j1 - nbjour)
if (m1 > 12):
    m1 = 1
    a1 = (a1 + 1)
print(j1, "/", m1, "/", a1)
