interface Donation {
  image: string;
  title: string;
  location: string;
}

function FeaturedDonationsCard({ donation }: { donation: Donation }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-2xl dark:shadow-slate-700 dark:border dark:border-slate-700 cursor-pointer">
      <img
        src={donation.image}
        alt={donation.title}
        className="w-full h-40 object-cover rounded-md"
      />
      <h3 className="mt-3 text-lg font-semibold dark:text-white">
        Food Item {donation.title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        Location: {donation.location}
      </p>
    </div>
  );
}

export default FeaturedDonationsCard;
