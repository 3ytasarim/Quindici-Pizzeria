import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function LunchMenuSection() {
  const lunchItems = [
    { day: "Montag", title: "Pizza Margherita", desc: "mit frischem Basilikum und Mozzarella", price: "9,50 €" },
    { day: "Dienstag", title: "Pasta al Pomodoro", desc: "hausgemachte Nudeln in fruchtiger Tomatensauce", price: "10,50 €" },
    { day: "Mittwoch", title: "Risotto del Giorno", desc: "cremiges Risotto mit saisonalem Gemüse", price: "11,50 €" },
    { day: "Donnerstag", title: "Lasagne al Forno", desc: "klassische Schichtnudeln aus dem Ofen", price: "12,00 €" },
    { day: "Freitag", title: "Insalata Mista con Pollo", desc: "gemischter Salat mit gegrillter Hähnchenbrust", price: "11,00 €" },
  ];

  return (
    <section className="py-24 bg-secondary/40">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-4">Wöchentlich wechselnd</h2>
          <h3 className="text-4xl md:text-5xl font-serif text-foreground">Mittagstisch der Woche</h3>
        </div>

        <div className="grid gap-4">
          {lunchItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Card className="rounded-none border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors" />
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-8 w-full">
                    <span className="text-primary font-serif italic text-lg md:w-32">{item.day}</span>
                    <div>
                      <h4 className="text-xl font-bold text-foreground mb-1">{item.title}</h4>
                      <p className="text-foreground/60 text-sm">{item.desc}</p>
                    </div>
                  </div>
                  <span className="text-xl font-serif text-foreground whitespace-nowrap">{item.price}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
