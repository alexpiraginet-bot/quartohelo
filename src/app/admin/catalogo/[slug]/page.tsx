import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuiaData } from "@/lib/content";
import { ItemTextosForm, OpcoesEditor } from "../../_components/AdminForms";

export const dynamic = "force-dynamic";

export default async function CategoriaAdmin({ params }: { params: { slug: string } }) {
  const { categories, options } = await getGuiaData();
  const entry = categories.flatMap((c) => c.items.map((item) => ({ item, cat: c }))).find((e) => e.item.slug === params.slug);
  if (!entry) notFound();
  const { item, cat } = entry;
  const itemOptions = options.filter((o) => o.itemSlug === item.slug);

  return (
    <div className="adm-wrap">
      <Link className="adm-back" href="/admin/catalogo">
        ← Catálogo
      </Link>
      <h1 className="adm-h">{item.name}</h1>
      <p className="adm-sub">
        {cat.name} · o que você salvar aqui aparece na hora no guia, na categoria &quot;{item.name}&quot;.
      </p>

      <div className="adm-section">
        <h2>Textos da decisão</h2>
        <div className="adm-cat">
          <ItemTextosForm item={item} />
        </div>
      </div>

      <div className="adm-section">
        <h2>Opções por faixa</h2>
        <p className="adm-sub" style={{ marginTop: 4 }}>
          Escolha a variação e preencha cada faixa. O guia mostra até 3 opções por faixa — pode deixar menos, se
          preferir (o que estiver vazio aparece como &quot;Em curadoria&quot;).
        </p>
        <OpcoesEditor item={item} options={itemOptions} />
      </div>
    </div>
  );
}
