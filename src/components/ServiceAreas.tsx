import { HomeIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const areas = [
  'Charlotte, NC',
  'Monroe, NC', 
  'Concord, NC',
  'Gastonia, NC',
  'Matthews, NC',
  'Mt Holly, NC',
  'Fort Mill, SC',
  'Mint Hill, NC',
  'Pineville, NC',
  'Rock Hill, SC',
  'Stallings, NC',
  'Weddington, NC',
  'Indian Trail, NC',
  'Waxhaw, NC',
  'Wesley Chapel, NC',
  'Tega Cay, SC',
  'Mineral Springs, NC',
  'Indian Land, SC',
  'Huntersville, NC',
  'Lake Norman, NC'
];

export default function ServiceAreas({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <section className="py-16 md:py-24 bg-slate-50">
      <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
        {showHeading && (
          <div className="text-center mb-12 md:mb-16">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Service Area</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              We Come To You
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Professional in-home TV repair service across Charlotte and surrounding communities.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {areas.map((area, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -3 }}
              className="flex items-center space-x-3 bg-white rounded-xl p-5 border border-slate-100 hover:border-primary/20 hover:shadow-md transition-all duration-300 group"
            >
              <div className="bg-secondary/50 rounded-lg p-2.5 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <HomeIcon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-slate-700 font-semibold text-base group-hover:text-primary transition-colors">{area}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}