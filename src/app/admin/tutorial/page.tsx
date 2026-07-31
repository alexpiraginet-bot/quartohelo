import Link from "next/link";
import { TUTORIAL, TUTORIAL_BASICS, TUTORIAL_TROUBLE } from "../_content/tutorial";

export const dynamic = "force-dynamic";

/* Aba "Como faço" do painel: passo a passo por tarefa, escrito para uso leigo.
 * O conteúdo mora em _content/tutorial.ts e é atualizado junto com cada
 * mudança do painel, no mesmo commit. */

export default function TutorialAdmin() {
  return (
    <div className="adm-wrap adm-tut">
      <h1 className="adm-h">Como faço</h1>
      <p className="adm-sub">
        O passo a passo de cada coisa que você pode mudar sozinha. Escolha o que quer fazer.
      </p>

      <section className="adm-cat">
        <h2 className="adm-tut-h2">Antes de tudo</h2>
        <ul className="adm-tut-basics">
          {TUTORIAL_BASICS.map((b, i) => (
            <li key={i}>
              {b.text}
              {b.note ? <small>{b.note}</small> : null}
            </li>
          ))}
        </ul>
      </section>

      {/* Índice: leva direto à tarefa, sem precisar rolar procurando. */}
      <nav className="adm-tut-index" aria-label="Tarefas">
        {TUTORIAL.map((sec) => (
          <div key={sec.id}>
            <b>{sec.title}</b>
            <ul>
              {sec.tasks.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`}>{t.title}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {TUTORIAL.map((sec) => (
        <section className="adm-cat" key={sec.id} id={sec.id}>
          <h2 className="adm-tut-h2">{sec.title}</h2>
          <p className="adm-tut-intro">{sec.intro}</p>
          {sec.tasks.map((t) => (
            <article className="adm-tut-task" key={t.id} id={t.id}>
              <h3>{t.title}</h3>
              <p className="res">{t.result}</p>
              <ol>
                {t.steps.map((s, i) => (
                  <li key={i}>
                    {s.text}
                    {s.note ? <small>{s.note}</small> : null}
                  </li>
                ))}
              </ol>
              <Link className="adm-btn soft" href={t.href}>
                {t.hrefLabel}
              </Link>
            </article>
          ))}
        </section>
      ))}

      <section className="adm-cat" id="problemas">
        <h2 className="adm-tut-h2">Quando algo não sai como esperado</h2>
        <dl className="adm-tut-trouble">
          {TUTORIAL_TROUBLE.map((t, i) => (
            <div key={i}>
              <dt>{t.q}</dt>
              <dd>{t.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="adm-tut-foot">
        Não achou o que precisa? Fale com a gente pelo WhatsApp que a gente resolve e acrescenta aqui.
      </p>
    </div>
  );
}
