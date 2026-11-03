Fonction Somme_Intervalle(T: TAB, p1: entier, p2: entier): entier
Début
  // Bloc 1
  p1 ← 1
  Si (p1 > p2) Alors p ← -1 Fin Si
  // Bloc 2
  s ← 0
  Pour i de p1 à p2 [pas = p] Faire
    s ← s + T[i]
  Fin Pour
  Retourner s
Fin

TDOL
Objet : Type/Nature
i, p : entier

Procédure Afficher_Equilibre(T: TAB, n: entier)
Début
  test ← Faux
  Pour k de 1 à n-2 Faire
    sg ← Somme_Intervalle(T, 0, k-1)
    sd ← Somme_Intervalle(T, k+1, n-1)
    Si sg = sd Alors
      Ecrire(k, "est un point d'équilibre")
      test ← Vrai
    Fin Si
  Fin Pour

  Si non test Alors
    Ecrire("Aucun point d'équilibre")
  Fin Si
Fin

TDOL
Objet : Type/Nature
test : booléen
k, sd, sg : entier

Algorithme NomAlgorithme
Début
  Répéter
    Ecrire("Donner n ? ") ; Lire(N)
  Jusqu'à 2 ≤ N ≤ 100
  Pour i de 1 à N Faire
    Si N mod i = 0 Alors
      s ← s + i
    Fin Si
  Fin Pour
Fin

TDO
Objet : Type/Nature
i, N : entier