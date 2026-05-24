Algorithme PP
Début
  Saisir(n)
  Remplir(t, n)
  x ← Calc(n)
  Ecrire("x = ", x)
Fin

TDNT
Tab1 = Tableau de 50 entier

TDOG
Objet : Type/Nature
n : entier
t : Tab1
Saisir : Procédure
Calc : Fonction

Procédure Saisir(@n: entier)
Début
  Répéter
  Ecrire("Entrez n ? ")
  Lire(n)
  Jusqu'à 5 ≤ n ≤ 10
Fin

Procédure Remplir(@t: Tab, n: entier)
Début
  Pour i de 0 à n - 1 Faire
    Répéter
      Ecrire("Entrez t[", i, "] ? ")
      Lire(t[i])
    Jusqu'à Verif(t[i])
  Fin Pour
Fin

TDOL
Objet : Type/Nature
i : entier
Verif : Fonction

Fonction Verif(ch: chaîne):booleen
Début
  test ← Long(ch) > 0
  i ← 0
  Tant que test et i < Long(ch) Faire
    test ← "A" ≤ Majus(ch[i]) ≤ "Z"
    i ← i + 1
  Fin Tant que
  Retourner test
Fin

TDOL
Objet : Type/Nature
test : booléen
i : entier

Fonction Calc(n: entier):entier
Début
  s ← 0
  Pour i de 0 à n-1 Faire
    s ← s + i
  Fin Pour
  Retourner s
Fin

TDO
Objet : Type/Nature
s, i : entier

Procédure Saisir2(@a: entier, deb: entier, fin: entier)
Début
  Répéter
    Ecrire("Donner", deb "≤ n ≤", fin, " ? ")
    Lire(n)
  Jusqu'à deb ≤ n ≤ fin
Fin
