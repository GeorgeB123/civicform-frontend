import Link from "next/link";

/**
 * Renders a header component with a customisable title.
 *
 * @param {Object} props - The component props.
 * @param {string} props.title - The title text to display in the header.
 * @returns {React.ReactElement} A header element with a dark blue background and white text.
 */
export default function Header({
  title,
  backLink,
  backLinkText,
}: {
  title: string;
  backLink?: string;
  backLinkText?: string;
}): React.ReactElement {
  return (
    <div className="bg-[#1e3a5f] text-white">
      <div className="bg-[#172b42] px-6 py-4">
        <div className="container mx-auto max-w-6xl flex items-center gap-4" />
      </div>
      <div className="px-6 py-12">
        <h1 className="text-4xl font-bold container mx-auto max-w-6xl">
          {title}
        </h1>
      </div>
      {backLink && (
        <div className="container mx-auto py-4 max-w-6xl">
          <Link className="underline hover:text-gray-200" href={backLink}>
            <strong>Back:</strong> {backLinkText}
          </Link>
        </div>
      )}
    </div>
  );
}
