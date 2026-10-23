# Passation : Ticket241 Admin Structure (version 2)

Refonte de l'espace organisateur `ticket241-admin-structure-web` sur le design Ticket241 (Source Serif 4, cyan `#0088b0`, magenta `#d6006c`, thèmes Papier / Encre / Noir & Blanc).

`Ticket241 Admin Structure.dc.html` est une **référence de design en HTML** (ouvrir dans un navigateur, tout est cliquable). Ce n'est pas du code à copier : il faut **reprendre ce design dans le code existant** (Vite + React + TypeScript + Tailwind + shadcn/ui), sans toucher à la logique métier (`src/lib/Transmission.ts`, `Cloudinary.ts`, appels API, schémas zod).

---

## Prompt pour Claude Code

```
Contexte : dépôt ticket241-admin-structure-web (Vite, React, TS, Tailwind, shadcn/ui).
Lis design/admin-v2/README.md puis ouvre design/admin-v2/Ticket241 Admin Structure.dc.html
comme référence visuelle.

Objectif : appliquer ce design à toutes les pages existantes, sans modifier la
logique métier ni les appels API (src/lib/*, react-hook-form, zod).

1. Thème : remplacer les variables de src/index.css et tailwind.config.ts par les
   jetons du README (3 thèmes via [data-theme] sur <html>, persistés en localStorage).
2. Police : Source Serif 4 partout (Google Fonts), aucune sans-serif.
3. Icônes : remplacer lucide-react par @phosphor-icons/react (weight="duotone",
   "fill" pour les états actifs).
4. Restyler les composants shadcn (button, badge, card, input, select, switch,
   tabs, table, dialog) selon le README.
5. Reprendre chaque page selon la section correspondante du README.
6. Ajouter : aperçu en direct + checklist dans EventForm, onglets Acheteurs et
   Catégories dans EventDetailPage, barre de publication groupée dans
   EventsListPage, conversation dans l'onglet Support.

Contraintes : vouvoiement, montants "15 000 FCFA" (espace insécable), chiffres
tabulaires, focus-visible cyan 2px, prefers-reduced-motion respecté,
responsive (barre latérale en tiroir sous 980px).
Termine en listant les fichiers modifiés.
```

---

## Jetons

```css
[data-theme="paper"]{--bg:#f3f2f2;--card:#fdfdfc;--surf:#eae9e9;--side:#eae9e9;--ink:#201e1d;--ink2:#605d5d;--ink3:#9b9797;--line:rgba(32,30,29,.13);--line2:rgba(32,30,29,.26);--acc:#0088b0;--accs:#e4f4fb;--acc2:#d6006c;--acc2s:#ffeef4;--on-acc:#fff;
  --sh:0 1px 2px rgba(45,43,43,.10);--shm:0 4px 14px rgba(45,43,43,.11);--shl:0 14px 38px rgba(45,43,43,.16)}
[data-theme="ink"]{--bg:#1b1a19;--card:#262423;--surf:#302e2c;--side:#151413;--ink:#f5f3f1;--ink2:#bab6b6;--ink3:#8a8685;--line:rgba(243,242,242,.14);--line2:rgba(243,242,242,.28);--acc:#62c5ee;--accs:rgba(98,197,238,.15);--acc2:#ff90b1;--acc2s:rgba(255,144,177,.15);--on-acc:#11201f;
  --sh:0 1px 2px rgba(0,0,0,.5);--shm:0 6px 18px rgba(0,0,0,.5);--shl:0 16px 40px rgba(0,0,0,.6)}
[data-theme="mono"]{--bg:#f4f3f2;--card:#fff;--surf:#e9e7e5;--side:#e9e7e5;--ink:#141312;--ink2:#5c5957;--ink3:#96918e;--line:rgba(20,19,18,.18);--line2:rgba(20,19,18,.4);--acc:#141312;--accs:#e6e3e0;--acc2:#4a4644;--acc2s:#e6e3e0;--on-acc:#fff}
```

Rayons : 4px boutons/champs, 6px cartes, 8px fenêtres, 99px pastilles. Images en thème Encre : `brightness(.92) saturate(.95)` ; N&B : `grayscale(1) contrast(1.12)`.
Logo : `logo.png` (transparent) ; sur fond sombre `filter: brightness(0) invert(1)`. Ne pas utiliser `logoblanc.png` (fond opaque).

Typo : titres de page `clamp(30px,3.6vw,42px)` 600 −0.03em ; titres de section 19–20px 600 ; libellés en capitales 10,5px 600 +0.14em `--ink3` ; corps 14–16px ; chiffres `font-variant-numeric: tabular-nums`.

## Statuts

| Statut | Libellé | Style |
| --- | --- | --- |
| published | Publié | fond `--accs`, texte `--acc` |
| draft | Brouillon | fond `--surf`, texte `--ink2` |
| pending_approval | En validation | contour `--line2`, texte `--ink` |
| cancelled | Annulé | fond `--acc2s`, texte `--acc2` |
| completed | Terminé | fond `--surf`, texte `--ink3` |

Contrôle d'accès : scan réussi (cyan), refusé (neutre), fraude (magenta), anomalie (contour). Ne jamais réutiliser vert/orange/jaune Tailwind.

## Coquille

- **Barre latérale** 256px, fond `--side`, filet droit `--line`. Logo + « Organisateur » ; carte structure (monogramme, nom, statut de vérification en magenta si non vérifiée) ; navigation (icône 19px, actif : fond `--card`, texte 600, barre cyan 3px à gauche, badge magenta du nombre de notifications non lues) ; en pied : sélecteur de thème en capsule, utilisateur, bouton déconnexion (confirmation).
- Sous 980px : tiroir depuis la gauche + voile, bouton menu dans l'en-tête.
- **En-tête** collant en verre (`--glass` + flou 14px) : fil d'Ariane, cloche avec point magenta, bouton cyan « Créer un événement ».
- Toasts : capsule `--ink` en bas au centre, 2,6 s. Confirmations : fenêtre 440px.

## Pages

**Connexion** (`LoginPage`, `ForgotPasswordPage`) : panneau photo sombre à gauche (« Vos soirées, vos chiffres, vos entrées. »), formulaire à droite (+241, mot de passe avec œil, « Rester connecté », lien mot de passe oublié). Oubli : saisie du numéro puis état « Lien envoyé ».

**Tableau de bord** : dateline (filet 3px, ligne capitales, filet 1px), « Bonjour, {prénom}. », 4 indicateurs (Événements, En vente, Billets vendus, Revenus bruts), ventes des 14 derniers jours (barres, aujourd'hui en cyan), carte « Prochain événement » avec remplissage, tableau des 5 événements récents.

**Mes événements** : recherche, filtres de statut avec compteurs, tableau (min-width 1080px, colonne Événement min 300px, titre tronqué) avec case à cocher sur les brouillons uniquement, remplissage en barre, revenus, actions modifier / dupliquer / supprimer (brouillons). Sélection → barre collante sombre « Publier la sélection ».

**Détail** : vignette, statut, titre, date/lieu ; actions Copier le lien / Modifier / (brouillon) Supprimer + Publier ; 4 chiffres (vendus avec barre, brut + net, vues + partages, commission 10 %) ; onglets Aperçu (description, ventes 14 j, paramètres, horaires) / Acheteurs (tableau + export CSV) / Catégories (cartes avec remplissage et CA).

**Créer / Modifier** (`EventForm` et sections) : 6 sections numérotées 01–06 (Informations générales avec catégories en pastilles, Date et lieu, Image de couverture en zone de dépôt, Catégories de billets, Contact organisateur, Paramètres avec interrupteurs et validation AUTO/MANUAL en cartes radio). Colonne droite collante : aperçu de la carte publique et checklist (titre/description, date/heure, lieu, image, ≥1 catégorie, contact) qui active le bouton de publication ; champs manquants en bordure magenta après une tentative.

**Ma structure** : bandeau « Structure non vérifiée » (magenta) → « Vérification en cours » ; Identité (logo, nom, type en pastilles, présentation), Contacts, Localisation, Enregistrer ; encadré « En chiffres ».

**Statistiques** : choix d'événement en pastilles, 6 indicateurs, ventes quotidiennes, onglets Répartition par catégorie (barre empilée + tableau) / Comparaison (barres par événement).

**Accès & contrôle** : 4 indicateurs, onglets Équipe (cartes membre, rôle, activer/suspendre), Agents de scan (PIN masqué avec œil, événements affectés), Contrôle par événement (entrées scannées / total, refusés, fraudes, anomalies), Historique (recherche + filtres de type).

**Notifications** : 4 indicateurs, onglet Notifications (non lues sur fond `--accs` + point magenta, clic = lu, « Tout marquer comme lu »), onglet Support (liste des demandes + fil de conversation + réponse).

**Finances** : 4 indicateurs, « Demander un versement », onglets Revenus par événement (brut / commission / net / statut de versement), Transactions, Moyens de versement (principal en bordure cyan), Factures & relevés.

---

## Commandes pour pousser sur une branche `version2`

```bash
git clone https://github.com/Tchelo8/ticket241-admin-structure-web.git
cd ticket241-admin-structure-web
git checkout -b version2
mkdir -p design/admin-v2
# copier le contenu de ce dossier dans design/admin-v2/
git add design/admin-v2
git commit -m "Design v2 : maquette et passation de l'espace organisateur"
git push -u origin version2
```

Puis lancer Claude Code sur la branche `version2` avec le prompt ci-dessus pour implémenter le design dans le code.

---

## Contenu du dossier

- `README.md` : ce document
- `Ticket241 Admin Structure.dc.html` : maquette navigable
- `support.js`, `_ds/` : nécessaires à l'ouverture de la maquette
- `assets/images/` : visuels de démonstration et logos

Les données de démo (Entre Nous Bar, événements, montants) sont fictives.
