import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext } from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import Product from '../../models/Product';
import db from '../../utils/db';
import { Store } from '../../utils/Store';
export default function ProductScreen(props) {
  const { product } = props;
  const { state, dispatch } = useContext(Store);
  const router = useRouter();
  if (!product) {
    return <Layout title="Produt Not Found">Produt Not Found</Layout>;
  }
  const addToCartHandler = async () => {
    const existItem = state.cart.cartItems.find((x) => x.slug === product.slug);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      return toast.error('Sorry. Product is out of stock');
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
    router.push('/cart');
  };
  return (
    <Layout title={product.name}>
      <div className="py-2">
        <Link href="/">back to products</Link>
      </div>
      <div className="grid md:grid-cols-4 md:gap-3">
        <div className="md:col-span-2">
          <Image
            src={product.image}
            alt={product.name}
            width={640}
            height={640}
            sizes="100vw"
            style={{
              width: '100%',
              height: 'auto',
            }}
          ></Image>
        </div>
        <div>
          <ul>
            <li>
              <h1 className="text-lg">{product.name}</h1>
            </li>
            <li className="mt-2">
              <span className="font-semibold">Category:</span>{' '}
              <span>{product.category}</span>
            </li>
            <li className="mt-1">
              <span className="font-semibold">Brand:</span>{' '}
              <span>{product.brand}</span>
            </li>

            <li className="mt-1">
              <div className="flex items-center">
                <span className="text-black-500 font-semibold">Rating:</span>
                <div className="flex ml-1">
                  {Array.from({ length: 5 }, (_, index) => (
                    <svg
                      key={index}
                      className={`h-4 w-4 fill-current ${
                        index < Math.floor(product.rating)
                          ? 'text-yellow-500'
                          : 'text-gray-400'
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 1l2.39 6.44h6.07l-4.92 4.48 1.88 6.12L10 14.64l-6.42 3.4 1.89-6.12L1.54 7.44h6.08z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-1 text-gray-500">
                  ({product.numReviews} reviews)
                </span>
              </div>
            </li>
            <li className="mt-1">
              <p className="text-sm">
                <span className="font-semibold">Description: </span>
                {product.description}
              </p>
            </li>
          </ul>
        </div>

        <div>
          <div className="card p-5">
            <div className="mb-2 flex justify-between">
              <div>Price</div>
              <div>${product.price}</div>
            </div>
            <div className="mb-2 flex justify-between">
              <div>Status</div>
              <div>{product.countInStock > 0 ? 'In stock' : 'Unavailable'}</div>
            </div>
            <button
              className="primary-button w-full"
              onClick={addToCartHandler}
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
export async function getServerSideProps(context) {
  const { params } = context;
  const { slug } = params;
  await db.connect();
  const product = await Product.findOne({ slug }).lean();
  await db.disconnect();
  return {
    props: {
      product: product ? db.convertDocToObj(product) : null,
    },
  };
}
