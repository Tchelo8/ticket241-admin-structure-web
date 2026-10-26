import { TicketCategory } from '@/types/event';
import { SectionTitle } from "./SectionTitle";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Ticket } from "@/components/icons";
import { useState } from 'react';

interface TicketCategoriesSectionProps {
  ticketCategories: TicketCategory[];
  onCategoriesChange: (categories: TicketCategory[]) => void;
}

// Types prédéfinis — la valeur choisie est envoyée telle quelle comme nom de catégorie
const TYPES_CATEGORIE = ['STANDARD', 'VIP', 'VVIP'];
const TYPE_AUTRE = 'AUTRE';

const emptyCategory = (): Omit<TicketCategory, 'id'> => ({
  name: '',
  description: '',
  price: 0,
  availableSeats: 0,    // → totalSeats backend
  maxPerPerson: 10,     // → maxTicketsPerOrder backend
  isEnabled: true,
  benefits: '',
  colorCode: '',
  displayOrder: 0,
});

export function TicketCategoriesSection({
  ticketCategories,
  onCategoriesChange,
}: TicketCategoriesSectionProps) {
  const [newCategory, setNewCategory] = useState<Omit<TicketCategory, 'id'>>(emptyCategory());
  const [typeSelectionne, setTypeSelectionne] = useState('');

  const handleTypeChange = (valeur: string) => {
    setTypeSelectionne(valeur);
    setNewCategory({ ...newCategory, name: valeur === TYPE_AUTRE ? '' : valeur });
  };

  const handleAddCategory = () => {
    if (!newCategory.name || newCategory.price <= 0 || newCategory.availableSeats <= 0) return;

    const category: TicketCategory = {
      id: crypto.randomUUID(),
      ...newCategory,
      displayOrder: ticketCategories.length, // ordre automatique
    };

    onCategoriesChange([...ticketCategories, category]);
    setNewCategory(emptyCategory());
    setTypeSelectionne('');
  };

  const handleRemoveCategory = (id: string) => {
    onCategoriesChange(ticketCategories.filter((cat) => cat.id !== id));
  };

  const handleToggleCategory = (id: string) => {
    onCategoriesChange(
      ticketCategories.map((cat) =>
        cat.id === id ? { ...cat, isEnabled: !cat.isEnabled } : cat
      )
    );
  };

  const totalSeats = ticketCategories
    .filter((c) => c.isEnabled)
    .reduce((acc, c) => acc + c.availableSeats, 0);

  return (
    <section className="t-card space-y-6 p-[22px]">
      <div className="flex items-center justify-between">
        <SectionTitle n="04">Catégories de billets *</SectionTitle>
        {ticketCategories.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {totalSeats} places au total
          </span>
        )}
      </div>

      {/* Catégories existantes */}
      {ticketCategories.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Catégories ajoutées</h4>
          <div className="grid gap-4">
            {ticketCategories.map((category) => (
              <div
                key={category.id}
                className={`p-4 border rounded-lg ${
                  category.isEnabled
                    ? 'border-border bg-background'
                    : 'border-muted bg-muted/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      {category.colorCode && (
                        <span
                          className="w-3 h-3 rounded-full inline-block border"
                          style={{ backgroundColor: category.colorCode }}
                        />
                      )}
                      <h5 className="font-medium">{category.name}</h5>
                      <span className="text-sm text-accent font-semibold">
                        {category.price.toLocaleString('fr-GA')} FCFA
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    )}
                    {category.benefits && (
                      <p className="text-xs text-muted-foreground italic">✓ {category.benefits}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {/* availableSeats = totalSeats côté backend */}
                      <span>{category.availableSeats} places</span>
                      {/* maxPerPerson = maxTicketsPerOrder côté backend */}
                      <span>Max {category.maxPerPerson}/commande</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`toggle-${category.id}`} className="text-sm">
                        {category.isEnabled ? 'Activé' : 'Désactivé'}
                      </Label>
                      <Switch
                        id={`toggle-${category.id}`}
                        checked={category.isEnabled}
                        onCheckedChange={() => handleToggleCategory(category.id)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCategory(category.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulaire d'ajout */}
      <div className="border-t pt-6">
        <h4 className="text-sm font-medium mb-4">Ajouter une catégorie</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* name */}
          <div className="space-y-2">
            <Label htmlFor="categoryName">Nom de la catégorie *</Label>
            <Select value={typeSelectionne} onValueChange={handleTypeChange}>
              <SelectTrigger id="categoryName">
                <SelectValue placeholder="Choisir un type" />
              </SelectTrigger>
              <SelectContent>
                {TYPES_CATEGORIE.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
                <SelectItem value={TYPE_AUTRE}>Autre</SelectItem>
              </SelectContent>
            </Select>
            {typeSelectionne === TYPE_AUTRE && (
              <Input
                placeholder="Ex: Early Bird, Étudiant..."
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
            )}
          </div>

          {/* price → BigDecimal backend */}
          <div className="space-y-2">
            <Label htmlFor="categoryPrice">Prix (FCFA) *</Label>
            <Input
              id="categoryPrice"
              type="number"
              min={1}
              step={500}
              value={newCategory.price || ''}
              onChange={(e) => setNewCategory({ ...newCategory, price: Number(e.target.value) })}
            />
          </div>

          {/* availableSeats → totalSeats backend */}
          <div className="space-y-2">
            <Label htmlFor="categorySeats">Nombre de places *</Label>
            <Input
              id="categorySeats"
              type="number"
              min={1}
              value={newCategory.availableSeats || ''}
              onChange={(e) => setNewCategory({ ...newCategory, availableSeats: Number(e.target.value) })}
            />
          </div>

          {/* maxPerPerson → maxTicketsPerOrder backend */}
          <div className="space-y-2">
            <Label htmlFor="categoryMaxPerPerson">Max tickets/commande</Label>
            <Input
              id="categoryMaxPerPerson"
              type="number"
              min={1}
              max={100}
              value={newCategory.maxPerPerson}
              onChange={(e) => setNewCategory({ ...newCategory, maxPerPerson: Number(e.target.value) })}
            />
          </div>

          {/* colorCode → #RRGGBB backend */}
          <div className="space-y-2">
            <Label htmlFor="categoryColor">Couleur</Label>
            <div className="flex items-center gap-2">
              <Input
                id="categoryColor"
                type="color"
                className="w-12 h-10 p-1 cursor-pointer"
                value={newCategory.colorCode || '#000000'}
                onChange={(e) => setNewCategory({ ...newCategory, colorCode: e.target.value })}
              />
              <Input
                placeholder="#RRGGBB"
                value={newCategory.colorCode}
                onChange={(e) => setNewCategory({ ...newCategory, colorCode: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>

          {/* description */}
          <div className="space-y-2">
            <Label htmlFor="categoryDescription">Description</Label>
            <Input
              id="categoryDescription"
              placeholder="Ex: Accès backstage, boissons incluses..."
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            />
          </div>

          {/* benefits → benefits backend */}
          <div className="space-y-2 md:col-span-2 lg:col-span-3">
            <Label htmlFor="categoryBenefits">Avantages inclus</Label>
            <Input
              id="categoryBenefits"
              placeholder="Ex: Boissons offertes, accès VIP, rencontre avec les artistes..."
              value={newCategory.benefits}
              onChange={(e) => setNewCategory({ ...newCategory, benefits: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Switch
              id="newCategoryEnabled"
              checked={newCategory.isEnabled}
              onCheckedChange={(checked) => setNewCategory({ ...newCategory, isEnabled: checked })}
            />
            <Label htmlFor="newCategoryEnabled">Activer immédiatement</Label>
          </div>

          <Button
            type="button"
            onClick={handleAddCategory}
            disabled={!newCategory.name || newCategory.price <= 0 || newCategory.availableSeats <= 0}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter la catégorie
          </Button>
        </div>
      </div>
    </section>
  );
}