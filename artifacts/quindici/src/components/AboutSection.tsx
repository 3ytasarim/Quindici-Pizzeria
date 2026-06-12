import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function AboutSection() {
  return (
    <section id="ueber-uns" className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 0%, transparent 60%)' }} />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-sm font-bold tracking-widest text-primary-foreground/80 uppercase mb-4"
          >
            Über uns
          </motion.h2>
          
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif mb-8"
          >
            Ein Stück Italien in Ludwigsburg
          </motion.h3>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed mb-10"
          >
            Willkommen in unserer Familie. Quindici Trattoria Pizzeria bringt die warme, herzliche Atmosphäre und die unverfälschten Aromen der italienischen Küche direkt in das Herz von Ludwigsburg. Wir glauben an die Magie von einfachen, hochwertigen Zutaten, die mit Liebe und Respekt für die Tradition zubereitet werden.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary uppercase tracking-widest text-sm font-semibold h-12 px-8 rounded-none transition-all">
              Mehr erfahren
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
