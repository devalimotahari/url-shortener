
const Redirect = () => {
  return null;
};

export function getServerSideProps() {
  const homeSiteUrl = process.env.HOME_SITE_URL;
  if (!homeSiteUrl) throw new Error('HOME_SITE_URL env not found!');

  return {
    redirect: {
      permanent: true,
      destination: homeSiteUrl
    }
  };
}

export default Redirect;
