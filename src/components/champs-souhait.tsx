type Valeurs = { titre?: string; lien?: string; prix?: number | null; note?: string };

/** Les champs d'une idée de cadeau, partagés par l'ajout et la modification. */
export function ChampsSouhait({ v = {}, id }: { v?: Valeurs; id: string }) {
  return (
    <>
      <div>
        <label className="etiquette" htmlFor={`titre-${id}`}>Idée de cadeau</label>
        <input id={`titre-${id}`} name="titre" className="champ" defaultValue={v.titre} required maxLength={120} placeholder="Un livre de recettes italiennes" />
      </div>
      <div className="grid grid-cols-[1fr_6rem] gap-3">
        <div>
          <label className="etiquette" htmlFor={`lien-${id}`}>Lien <span className="font-normal text-doux">(facultatif)</span></label>
          <input id={`lien-${id}`} name="lien" className="champ" defaultValue={v.lien} inputMode="url" placeholder="https://…" />
        </div>
        <div>
          <label className="etiquette" htmlFor={`prix-${id}`}>Prix (€)</label>
          <input id={`prix-${id}`} name="prix" className="champ" defaultValue={v.prix ?? ""} inputMode="numeric" placeholder="25" />
        </div>
      </div>
      <div>
        <label className="etiquette" htmlFor={`note-${id}`}>Précision <span className="font-normal text-doux">(taille, couleur…)</span></label>
        <input id={`note-${id}`} name="note" className="champ" defaultValue={v.note} maxLength={300} />
      </div>
    </>
  );
}
