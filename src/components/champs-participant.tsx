/** Prénom, e-mail et téléphone d'un participant, saisis par l'organisateur. */
export function ChampsParticipant({ id, v = {} }: { id: string; v?: { prenom?: string; email?: string; telephone?: string } }) {
  return (
    <>
      <div>
        <label className="etiquette" htmlFor={`prenom-${id}`}>Prénom</label>
        <input id={`prenom-${id}`} name="prenom" className="champ" defaultValue={v.prenom} required maxLength={40} />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label className="etiquette" htmlFor={`email-${id}`}>E-mail <span className="font-normal text-doux">(facultatif)</span></label>
          <input id={`email-${id}`} name="email" type="email" className="champ" defaultValue={v.email} maxLength={120} autoComplete="off" />
        </div>
        <div>
          <label className="etiquette" htmlFor={`telephone-${id}`}>Téléphone <span className="font-normal text-doux">(facultatif)</span></label>
          <input id={`telephone-${id}`} name="telephone" type="tel" className="champ" defaultValue={v.telephone} maxLength={30} autoComplete="off" />
        </div>
      </div>
    </>
  );
}
