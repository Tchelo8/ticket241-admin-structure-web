import { TicketCategory } from '@/types/event';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Ticket } from 'lucide-react';
import { useState } from 'react';

interface TicketCategoriesSectionProps {
  ticketCategories: TicketCategory[];
  onCategoriesChange: (categories: TicketCategory[]) => void;
}

export function TicketCategoriesSection({
  ticketCategories,
  onCategoriesChange,
}: TicketCategoriesSectionProps) {
  const [newCategory, setNewCategory] = useState<Omit<TicketCategory, 'id'>>({
    name: '',
    description: '',
    price: 0,
    availableSeats: 0,
    maxPerPerson: 5,
    isEnabled: true,
  });

  const handleAddCategory = () => {
    if (!newCategory.name || newCategory.price <= 0 || newCategory.availableSeats <= 0) {
      return;
    }

    const category: TicketCategory = {
      id: crypto.randomUUID(),
      ...newCategory,
    };

    onCategoriesChange([...ticketCategories, category]);
    setNewCategory({
      name: '',
      description: '',
      price: 0,
      availableSeats: 0,
      maxPerPerson: 5,
      isEnabled: true,
    });
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

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Ticket className="h-5 w-5" />
        Catégories de billets
      </h3>

      {/* Existing categories */}
      {ticketCategories.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            Catégories ajoutées
          </h4>
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
                      <h5 className="font-medium">{category.name}</h5>
                      <span className="text-sm text-accent font-semibold">
                        {category.price.toLocaleString()} FCFA
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{category.availableSeats} places</span>
                      <span>Max {category.maxPerPerson}/pers.</span>
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

      {/* Add new category form */}
      <div className="border-t pt-6">
        <h4 className="text-sm font-medium mb-4">Ajouter une catégorie</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">Nom de la catégorie *</Label>
            <Input
              id="categoryName"
              placeholder="Ex: VIP, Standard, Early Bird"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryPrice">Prix (FCFA) *</Label>
            <Input
              id="categoryPrice"
              type="number"
              min={0}
              step={500}
              value={newCategory.price || ''}
              onChange={(e) =>
                setNewCategory({ ...newCategory, price: Number(e.target.value) })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categorySeats">Places disponibles *</Label>
            <Input
              id="categorySeats"
              type="number"
              min={1}
              value={newCategory.availableSeats || ''}
              onChange={(e) =>
                setNewCategory({
                  ...newCategory,
                  availableSeats: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryMaxPerPerson">Max tickets/personne</Label>
            <Input
              id="categoryMaxPerPerson"
              type="number"
              min={1}
              max={20}
              value={newCategory.maxPerPerson}
              onChange={(e) =>
                setNewCategory({
                  ...newCategory,
                  maxPerPerson: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="categoryDescription">Description</Label>
            <Input
              id="categoryDescription"
              placeholder="Ex: Accès backstage, boissons incluses..."
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory({ ...newCategory, description: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Switch
              id="newCategoryEnabled"
              checked={newCategory.isEnabled}
              onCheckedChange={(checked) =>
                setNewCategory({ ...newCategory, isEnabled: checked })
              }
            />
            <Label htmlFor="newCategoryEnabled">Activer immédiatement</Label>
          </div>

          <Button
            type="button"
            onClick={handleAddCategory}
            disabled={
              !newCategory.name ||
              newCategory.price <= 0 ||
              newCategory.availableSeats <= 0
            }
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter la catégorie
          </Button>
        </div>
      </div>
    </div>
  );
}
