Fonction CalculerMoyenne(note1: Réel, note2 : Réel) : Réel
Début
  /* Calcul de la moyenne
     arithmétique de deux notes */
  Retourner (note1 + note2) / 2
Fin

TDOL
Objet : Type/Nature
note1, note2 : Réel

Algorithme TestEcrireEtCommentaires
Début
  /* Démonstration :
     1. Des commentaires multi-lignes
     2. Du formatage de Ecrire avec sep et fin
     3. De l'autocomplétion des sous-programmes */
  m ← CalculerMoyenne(15.5, 18.5)
  m1 ← CalculerMoyenne(16, 19)

  Ecrire("--- Affichage standard ---")
  Ecrire("Moyenne : ", m)
  Ecrire("Moyenne 1 : ", m1)

  Ecrire("--- Affichage avec séparateur personnalisé ---")
  Ecrire("Tunisie", "Sousse", "Tunis", "Monastir", sep=" -> ")

  Ecrire("--- Affichage avec sep et fin ---")
  Ecrire(1, 2, 3, sep=" - ", fin=" [Fin de liste]\n")
Fin

TDO
Objet : Type/Nature
m, m1 : Réel
CalculerMoyenne : Fonction
