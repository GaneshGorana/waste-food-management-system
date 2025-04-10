interface SectionData {
  alignment: "right" | "left";
  imgSrc: string;
  heading: string;
  paragraph: string;
  lists?: string[];
}

function AlignmentCard({ sectionData }: { sectionData: SectionData }) {
  return (
    <section
      className={`flex flex-col md:flex-row ${
        sectionData.alignment === "right" ? "md:flex-row-reverse" : ""
      } items-center p-10 md:p-16 bg-white dark:bg-slate-800`}
    >
      <div className="md:w-1/2">
        <img
          src={sectionData.imgSrc}
          alt={sectionData.heading}
          className="w-full rounded-lg shadow-md"
        />
      </div>
      <div className="md:w-1/2 mt-6 md:mt-0 md:px-10">
        <h2 className="text-3xl font-bold dark:text-white">
          {sectionData.heading}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {sectionData.paragraph}
        </p>
        {sectionData.lists && sectionData?.lists?.length > 0 && (
          <ul className="mt-4 list-disc pl-5 text-gray-600 dark:text-gray-400">
            {sectionData?.lists?.map((text, index) => (
              <li key={index}>{text}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default AlignmentCard;
