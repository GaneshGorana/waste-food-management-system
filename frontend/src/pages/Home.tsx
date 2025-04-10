import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import fd1 from "../assets/fd1.jpg";
import fd2 from "../assets/fd2.jpg";
import fh1 from "../assets/fh1.png";
import fh2 from "../assets/fh2.png";
import fh3 from "../assets/fh3.png";
import heroImage from "../assets/food.png";
const AlignmentCard = lazy(() => import("../components/AlignmentCard.js"));
const FeaturedDonationsCard = lazy(
  () => import("../components/FeaturedDonationsCard.js")
);
import LoadingScreen from "../components/LoadingScreen.js";

function Home() {
  const donations = [
    {
      id: 1,
      title: "Food Donation 1",
      image: fh1,
      location: "City Center",
    },
    {
      id: 2,
      title: "Food Donation 2",
      image: fh2,
      location: "Main Street",
    },
    {
      id: 3,
      title: "Food Donation 3",
      image: fh3,
      location: "North Park",
    },
  ];
  const sectionData: {
    imgSrc: string;
    heading: string;
    paragraph: string;
    lists: string[];
    alignment: "left" | "right";
  }[] = [
    {
      imgSrc: fd1,
      heading: "Why Donate Food?",
      paragraph:
        "Your generous donation helps provide nutritious meals to those in need, reduces food waste, and supports a sustainable future. With your contribution, we can bridge the gap between excess food and hunger.",
      lists: [
        "Provide food to individuals and families in need.",
        "Reduce environmental impact by preventing food waste.",
        "Get a chance for helping people.",
        "Make a difference in your community.",
      ],
      alignment: "left",
    },
    {
      imgSrc: fd2,
      heading: "How We Collect Food",
      paragraph:
        "Our dedicated team of volunteers ensures the safe collection and distribution of food. We partner with local businesses, food donors, and individuals to gather food that is still perfectly good but might otherwise go to waste.",
      lists: [
        "Donors can schedule a pickup or drop-off at convenient locations.",
        "Food is carefully sorted and checked for quality and freshness.",
        "Our team tracks food donations using GPS to ensure efficient distribution.",
        "We aim to make sure that no edible food goes to waste while helping those in need.",
      ],
      alignment: "right",
    },
  ];
  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-slate-800">
      <header className="flex flex-col md:flex-row items-center justify-between text-white bg-blue-600 dark:bg-slate-800 py-20 px-6 md:px-16">
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-5xl font-bold">Helping Reduce Food Waste</h1>
          <p className="mt-4 text-lg">
            Connecting donors with those in need efficiently.
          </p>
          <Link
            to="/donate"
            className="mt-6 inline-block bg-white text-blue-600 dark:bg-slate-700 dark:text-white px-6 py-2 rounded-lg shadow-md"
          >
            Donate Now
          </Link>
        </div>
        <div className="md:w-1/2 mt-6 md:mt-0">
          <img
            src={heroImage}
            alt="Hero"
            className="w-full rounded-lg shadow-lg"
          />
        </div>
      </header>

      <Suspense fallback={<LoadingScreen isLoading={true} text="Loading" />}>
        {sectionData.map((section, i) => (
          <AlignmentCard key={i} sectionData={section} />
        ))}
      </Suspense>
      <Suspense fallback={<LoadingScreen isLoading={true} text="Loading" />}>
        <section className="p-10 md:p-16 text-center">
          <h2 className="text-3xl font-bold dark:text-white">
            Recent Donations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {donations.map((donation, i) => (
              <FeaturedDonationsCard key={i} donation={donation} />
            ))}
          </div>
        </section>
      </Suspense>
    </div>
  );
}

export default Home;
