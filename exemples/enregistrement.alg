Algorithme ExempleEnregistrement
Début
  // Remplissage d'un tableau d'enregistrements Etudiant
  classe[0].nom ← "Sami"
  classe[0].moyenne ← 16.5

  classe[1].nom ← "Mouna"
  classe[1].moyenne ← 18.0

  // Copie globale d'enregistrement
  major ← classe[1]

  Ecrire("--- Liste des étudiants ---")
  Pour i De 0 A 1 Faire
    Ecrire("Nom : ", classe[i].nom, " | Moyenne : ", classe[i].moyenne)
  Fin Pour

  Ecrire("Major de promotion : ", major.nom, " avec ", major.moyenne)
Fin

TDO
Objet : Type/Nature
major : Etudiant
classe : Tableau de 2 Etudiant
i : entier

TDNT
Etudiant = Enregistrement
  nom : chaîne
  moyenne : réel
Fin
