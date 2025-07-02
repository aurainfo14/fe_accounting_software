import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';


// ----------------------------------------------------------------------

export default function PostDetailsHomePage() {
  const params = useParams();

  const { title } = params;

  return (
    <>
      <Helmet>
        <title> Post: Details</title>
      </Helmet>

    </>
  );
}
