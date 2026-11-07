Algorithme Exercice7
Début
  Ecrire("La date d'aujourd'hui ?") ; Lire(dt)
  j ← Valeur(sous_chaine(dt, 0, 2))
  m ← Valeur(sous_chaine(dt, 3, 5))
  a ← Valeur(sous_chaine(dt, 6, 10))
  j1 ← j + 3
  m1 ← m
  a1 ← a
  Selon m1 Faire
    1, 3, 5, 7, 8, 10, 12: nbjour ← 31
    4, 6, 9, 11: nbjour ← 30
    2: nbjour ← 28
       Si a1 mod 4 = 0 Alors
         nbjour ← 29
       Fin Si
  Fin Selon

  Si j1 > nbjour Alors
    m1 ← m1 + 1
    j1 ← j1 - nbjour
  Fin Si

  Si m1 > 12 Alors
    m1 ← 1
    a1 ← a1 + 1
  Fin Si

  Ecrire(j1, "/", m1, "/", a1)
Fin

TDO
Objet : Type/Nature
dt, j1, m1, a1, nbjour : entier
j, m : chaîne
