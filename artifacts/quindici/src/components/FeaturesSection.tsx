import { motion } from "framer-motion";
import { Leaf, MapPin, UtensilsCrossed } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Leaf,
      title: "Frische Zutaten",
      description: "Täglich frisch ausgewählte Zutaten für den perfekten Geschmack."
    },
    {
      icon: MapPin,
      title: "Regionale Produkte",
      description: "Wir unterstützen lokale Erzeuger aus Ludwigsburg und Umgebung."
    },
    {
      icon: UtensilsCrossed,
      title: "Echte Italiana Küche",
      description: "Traditionelle Familienrezepte, die Generationen überdauert haben."
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 mb-6 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500">
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif text-foreground mb-3">{feature.title}</h3>
              <p className="text-foreground/70 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
