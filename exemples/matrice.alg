Algorithme ExempleMatrice
Début
  // Remplissage de la matrice 3x3 avec i * 10 + j
  Pour i De 0 A 2 Faire
    Pour j De 0 A 2 Faire
      M[i, j] ← (i + 1) * 10 + (j + 1)
    Fin Pour
  Fin Pour

  // Affichage des éléments et calcul de la trace (diagonale)
  trace ← 0
  Ecrire("--- Contenu de la matrice 3x3 ---")
  Pour i De 0 A 2 Faire
    Ecrire("Ligne ", i, " : ", M[i, 0], "  ", M[i, 1], "  ", M[i, 2])
    trace ← trace + M[i, i]
  Fin Pour

  Ecrire("Trace de la matrice = ", trace)
Fin

TDNT
Mat3x3 = Tableau de 3 lignes * 3 colonnes entier

TDO
Objet : Type/Nature
M : Mat3x3
i, j, trace : entier
