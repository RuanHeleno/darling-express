import { AppShell, PrimaryButton, SectionCard, TextField } from "@/components";

export function ProductFormScreen() {
  return (
    <AppShell title="Cadastrar Produto" subtitle="Adicione itens, preços e atributos do catálogo.">
      <SectionCard title="Produto novo" actionLabel="Admin only">
        <TextField label="Nome" placeholder="Ex.: Esmalte Nude" />
        <TextField label="Preço" placeholder="R$ 0,00" keyboardType="numeric" />
        <TextField label="Estoque" placeholder="Quantidade" keyboardType="numeric" />
        <PrimaryButton label="Salvar produto" />
      </SectionCard>
    </AppShell>
  );
}
