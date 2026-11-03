Algorithme ExempleFichiers
Début
  // 1. Écriture dans un fichier texte
  Ouvrir("notes.txt", f, "w")
  Ecrire_nl(f, "Algorithmique et Programmation")
  Ecrire_nl(f, "Session Principale 2026")
  Ecrire_nl(f, "Note maximale : 20")
  Fermer(f)

  // 2. Lecture séquentielle ligne par ligne
  Ecrire("--- Lecture du fichier texte notes.txt ---")
  Ouvrir("notes.txt", f, "r")
  num ← 1
  Tant Que Non Fin_fichier(f) Faire
    Lire_ligne(f, ligne)
    Ecrire("Ligne ", num, " : ", ligne)
    num ← num + 1
  Fin Tant Que
  Fermer(f)
Fin

TDO
Objet : Type/Nature
f : Fichier Texte
ligne : chaîne
num : entier
