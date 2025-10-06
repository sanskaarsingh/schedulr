import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    // These classes will make the container fill the space and center its content
    <div className="flex flex-col items-center justify-center flex-grow text-center">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
        The Simple Way to Manage Your Bookings
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
        Schedulr gives you a private calendar with a public, shareable link. Let others book available slots without the back-and-forth emails.
      </p>
      <div className="flex items-center justify-center mt-10 gap-x-6">
        <Link
          to="/auth"
          className="rounded-md bg-orange-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 transition-colors duration-200"
        >
          Get started
        </Link>
      </div>
    </div>
  );
};

export default HomePage;