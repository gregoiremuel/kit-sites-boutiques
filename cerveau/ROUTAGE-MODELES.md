# Routage des modèles : quel cerveau pour quelle tâche (2026-10-31)

Principe : **un modèle chef** décide et relit ; des **modèles ouvriers** exécutent ; on change un modèle ici sans toucher au reste. Les noms exacts changent souvent : les vérifier le jour même (docs du fournisseur), ne jamais les deviner.

| Tâche | Niveau | Exemples aujourd'hui | Pourquoi |
|---|---|---|---|
| Direction artistique, architecture, arbitrages, textes importants, relecture finale | **Chef** | Claude Opus | jugement, goût, rigueur |
| Exécuter un plan validé (code, contenu, réglages) | **Ouvrier fort** | Claude Sonnet, GLM (Coding Plan) | bon rapport qualité/coût |
| Tests répétitifs, relecture de captures, tri, résumés | **Ouvrier léger** | Claude Haiku, GLM rapide | peu cher, rapide |
| Vision (regarder une capture, une photo de bijou) | selon l'outil | Claude ; GLM avec le MCP Vision de z.ai | sans vision, pas de jugement visuel |

## Ne jamais être bloqué par une limite
- **Repli automatique** : si le chef ou l'ouvrier atteint sa limite, passer au suivant de la liste (ex. Claude → GLM → autre), en le disant à Greg. Dans EIMS : passerelle LiteLLM (budgets, repli, coûts) ; à la main : Claude Code branché sur GLM (`ANTHROPIC_BASE_URL`).
- **Abonnement ≠ API** : les abonnements (Claude, GLM Coding Plan) servent dans leurs outils officiels ; une plateforme automatique utilise des **clés API** avec un plafond de dépense.
- **Économiser** : sous-agents légers pour le mécanique, lecture ciblée des fichiers, cache des invites, pas de relecture inutile.
