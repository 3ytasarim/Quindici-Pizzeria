import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MenuPreviewSection() {
  const categories = [
    {
      name: "Antipasti",
      items: [
        { name: "Bruschetta Classica", desc: "Geröstetes Brot mit Tomaten, Knoblauch und Basilikum", price: "7,50 €" },
        { name: "Carpaccio di Manzo", desc: "Hauchdünnes Rinderfilet mit Rucola und Parmesan", price: "13,50 €" },
        { name: "Vitello Tonnato", desc: "Zartes Kalbfleisch mit Thunfischsauce und Kapern", price: "12,50 €" },
      ]
    },
    {
      name: "Pizza",
      items: [
        { name: "Margherita", desc: "San Marzano Tomaten, Mozzarella, frisches Basilikum", price: "9,50 €" },
        { name: "Quindici Speciale", desc: "Trüffelcreme, Parmaschinken, Burrata, Rucola", price: "16,50 €" },
        { name: "Diavola", desc: "Scharfe italienische Salami, Peperoni, rote Zwiebeln", price: "12,50 €" },
      ]
    },
    {
      name: "Pasta",
      items: [
        { name: "Spaghetti Carbonara", desc: "Mit Guanciale, Ei, Pecorino Romano und schwarzem Pfeffer", price: "13,00 €" },
        { name: "Tagliatelle al Tartufo", desc: "Frische Trüffel, Parmesan, leichte Butter-Sahne-Sauce", price: "18,50 €" },
        { name: "Penne Salmone", desc: "Lachsstreifen in Hummersauce mit einem Schuss Cognac", price: "15,50 €" },
      ]
    }
  ];

  return (
    <section id="speisekarte" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-4">Kulinarische Reise</h2>
          <h3 className="text-4xl md:text-5xl font-serif text-foreground mb-6">Ein Blick in unsere Karte</h3>
          <div className="w-24 h-1 bg-primary/30 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {categories.map((category, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
            >
              <Card className="h-full border-none shadow-none bg-secondary/20">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="font-serif text-2xl text-primary">{category.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {category.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex flex-col">
                      <div className="flex justify-between items-baseline mb-1 gap-4">
                        <h4 className="font-bold text-foreground">{item.name}</h4>
                        <div className="flex-grow border-b border-dotted border-foreground/20 mx-2" />
                        <span className="font-serif text-foreground whitespace-nowrap">{item.price}</span>
                      </div>
                      <p className="text-sm text-foreground/60 leading-snug">{item.desc}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/5 uppercase tracking-widest text-sm font-semibold h-12 px-8 rounded-none">
            Ganze Speisekarte ansehen
          </Button>
        </div>
      </div>
    </section>
  );
}
