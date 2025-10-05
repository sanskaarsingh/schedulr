import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
        The Simple Way to Manage Your Bookings
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-600">
        Schedulr gives you a private calendar with a public, shareable link. Let others book available slots without the back-and-forth emails.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Link
          to="/auth"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Get started
        </Link>
      </div>
    </div>
  );
};

export default HomePage;