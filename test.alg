// Test complet de la coloration syntaxique Algorithme
// Test: Commentaires (insensible à la casse)

// === Test: Mots-clés en minuscules ===
algorithme TestMinuscules
debut
  entier : age
  si age > 18 alors
    ecrire("Adulte")
  sinon
    ecrire("Mineur")
  fin si


  

  tant que age < 30 faire
    age ← age + 1
  fin tant que

  repeter
    age ← age - 1
  jusqua age = 25

  pour i de 1 a 10 pas 2 faire
    ecrire(i)
  fin pour 

  tant que a >= 10 faire
    ecrire("a est supérieur ou égal à 10")
  fin tant que

  si a >= 10 alors
    ecrire("a est supérieur ou égal à 10")
  fin si
fin

Algorithme TestMajuscules
Début
  ENTIER : age
  SI age > 18 ALORS
    ECRIRE("Adulte")
  SINON
    ECRIRE("Mineur")
  FIN SI

  TANT QUE age < 30 FAIRE
    age ← age + 1
  FIN TANT QUE

  REPETER
    age ← age - 1
  JUSQUA age = 25

  POUR i DE 1 A 10 PAS 2 FAIRE
    ECRIRE(i)
  FAIRE
FIN

Algorithme TestMixte
Début
  // Test: Types de données (casse mixte)
  Entier : age
  Réel : moyenne
  Booléen : estValide
  Caractère : lettre
  Chaine : message
  Tableau : notes[10]

  // Test: Constantes booléennes
  estValide ← VRAI
  estValide ← FAUX
  estValide ← vrai
  estValide ← faux

  // Test: Chaînes de caractères
  message ← "Bonjour le monde!"
  Ecrire("Saisir un nombre : ")

  // Test: Opérateurs arithmétiques
  age ← 25
  moyenne ← (15 + 20 - 5) * 10 / 2
  moyenne ← 15 DIV 2
  moyenne ← 17 MOD 3

  // Test: Opérateurs de comparaison
  SI age > 18 ALORS
    Ecrire("Majeur")
  FIN SI

  SI age < 10 ALORS
    Ecrire("Enfant")
  FIN SI

  SI age >= 18 ALORS
    Ecrire("Adulte")
  FIN SI

  SI age <= 17 ALORS
    Ecrire("Mineur")
  FIN SI

  SI age = 18 ALORS
    Ecrire("Exactement 18")
  FIN SI

  SI age ≠ 18 ALORS
    Ecrire("Pas exactement 18")
  FIN SI

  SI 5 ∈ notes ALORS
    Ecrire("5 est dans le tableau")
  FIN SI

  // Test: Opérateur d'affectation
  x ← 10
  y ← x + 5

  // Test: Fonctions prédéfinies (casse mixte)
  LIRE(age)
  ECRIRE(moyenne)
  ALEA(1, 100)
  CHR(65)
  ORD('A')
  SOUS_CHAINE(message, 1, 5)
  EFFACER(message)
  LONG(message)
  ENT(3.14)
  ESTNUM("123")
  CONVCH(123)
  VALEUR("456")

  // Test: Accès aux tableaux et chaînes
  notes[1] ← 15
  notes[i + 1] ← notes[1] + 5
  message[3] ← 'a'

  // Test: Nombres
  x ← 100
  y ← 3.14
  z ← 0.5

  si x >= 100 alors
    ecrire("x est supérieur ou égal à 100")
  fin si
Fin

// Test: Procédure et Fonction (casse mixte)
procédure afficherMessage(message : CHAINE)
Debut
  ECRIRE(message)
FIN

FONCTION calculerSomme(a : ENTIER, b : ENTIER) → ENTIER
DEBUT
  si a <= b alors 
    Retourner a + b
  sinon
    Retourner b - a
  fin si
FIN

procédure saisir(@n: entier)
Debut
  Répéter
    Ecrire("Saisir un nombre : ")
    LIRE(n)
  Jusqu'à 10 <= n <= 20 ou n ∈ [10, 20]
FIN