import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, User, Tag, ArrowLeft, MessageCircle, ShoppingCart, Lock, Minus, Plus, Ticket, Star } from 'lucide-react';
import { ticketsAPI, ordersAPI } from '../utils/api';
import { formatDate, formatCurrency, calculateDiscount, getTicketTypeLabel } from '../utils/helpers';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const response = await ticketsAPI.getById(id);
      setTicket(response.data.data.ticket);
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to buy tickets');
      navigate('/login');
      return;
    }

    if (ticket.seller?._id === user._id) {
      toast.error('You cannot buy your own ticket');
      return;
    }

    if (ticket.status !== 'available') {
      toast.error('This ticket is no longer available');
      return;
    }

    if (quantity > ticket.quantity) {
      toast.error(`Only ${ticket.quantity} ticket(s) available`);
      return;
    }

    setIsBuying(true);
    try {
      const response = await ordersAPI.create({
        ticketId: ticket._id,
        quantity,
      });
      
      const { order } = response.data.data;
      
      toast.success('Order created! Redirecting to payment...');
      navigate(`/checkout/${order._id || order.id}`);
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setIsBuying(false);
    }
  };

  const incrementQty = () => {
    if (ticket && quantity < ticket.quantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQty = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="card h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-bold text-gray-900">Ticket not found</h2>
          <Link to="/tickets" className="btn-primary mt-4 inline-flex">
            Browse Tickets
          </Link>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount(ticket.originalPrice, ticket.resalePrice);
  const totalPrice = ticket.resalePrice * quantity;

  return (
    <div className="min-h-screen bg-transparent py-8">
      <div className="container-custom">
        {/* Back Link */}
        <Link to="/tickets" className="inline-flex items-center text-slate-400 hover:text-indigo-400 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tickets
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl">
              {ticket.images && ticket.images.length > 0 ? (
                <img
                  src={ticket.images[0].url}
                  alt={ticket.title}
                  className="w-full h-[500px] object-cover"
                />
              ) : (
                <div className="w-full h-[500px] bg-slate-900 flex items-center justify-center">
                  <Tag className="h-24 w-24 text-slate-700" />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl mt-6 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-bold text-slate-100 mb-4 font-display">Description</h2>
              <p className="text-slate-400 text-lg leading-relaxed whitespace-pre-line">{ticket.description}</p>
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl">
              <div className="flex items-baseline space-x-3 mb-2">
                <span className="text-4xl font-bold text-indigo-400 font-display">
                  {formatCurrency(ticket.resalePrice)}
                </span>
                {discount > 0 && (
                  <>
                    <span className="text-lg text-slate-500 line-through">
                      {formatCurrency(ticket.originalPrice)}
                    </span>
                    <span className="bg-indigo-500 text-slate-950 px-2 py-0.5 rounded-lg text-xs font-bold">{discount}% OFF</span>
                  </>
                )}
              </div>
              <p className="text-sm text-slate-500 mb-6 font-medium">per ticket · Including all taxes</p>

              {/* Available tickets count */}
              <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                <Ticket className="h-5 w-5 text-indigo-500" />
                <span className="text-sm font-semibold text-slate-300">
                  {ticket.quantity > 0 ? (
                    <>{ticket.quantity} ticket{ticket.quantity !== 1 ? 's' : ''} available</>
                  ) : (
                    <span className="text-rose-400">Sold Out</span>
                  )}
                </span>
              </div>

              {/* Quantity Selector */}
              {ticket.quantity > 0 && ticket.status === 'available' && (
                <div className="mb-8">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">Purchase Quantity</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={decrementQty}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center bg-slate-800 text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-700 disabled:opacity-50 transition-all shadow-lg"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-2xl font-bold text-slate-100 w-8 text-center">{quantity}</span>
                    <button
                      onClick={incrementQty}
                      disabled={quantity >= ticket.quantity}
                      className="w-10 h-10 flex items-center justify-center bg-indigo-500 text-slate-950 border border-indigo-400 rounded-xl hover:bg-indigo-400 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/10"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-slate-500 ml-2 font-medium">
                      of {ticket.quantity}
                    </span>
                  </div>
                  {quantity > 1 && (
                    <p className="text-sm text-indigo-400 mt-4 font-bold flex items-center gap-2">
                       <span className="text-slate-500 font-normal">Subtotal:</span> {formatCurrency(totalPrice)}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {isAuthenticated && user ? (
                  ticket.seller?._id === user._id ? (
                    <button 
                      className="w-full py-4 bg-slate-800 text-slate-500 border border-slate-700 rounded-2xl flex items-center justify-center font-bold cursor-not-allowed"
                      disabled
                    >
                      <Lock className="h-5 w-5 mr-2" />
                      Your Listing
                    </button>
                  ) : (
                    <button 
                      className="w-full py-4 bg-indigo-500 text-slate-950 rounded-2xl flex items-center justify-center font-bold hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                      onClick={handleBuyNow}
                      disabled={isBuying || ticket.status !== 'available' || ticket.quantity < 1}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2 text-slate-950" />
                      {isBuying ? 'Processing...' : quantity > 1 ? `Buy ${quantity} Tickets — ${formatCurrency(totalPrice)}` : 'Secure Ticket Now'}
                    </button>
                  )
                ) : (
                  <Link to="/login" className="w-full py-4 bg-indigo-500 text-slate-950 rounded-2xl flex items-center justify-center font-bold hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20">
                    <Lock className="h-5 w-5 mr-2" />
                    Login to Buy
                  </Link>
                )}
                <button className="w-full py-4 bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl flex items-center justify-center font-bold hover:bg-slate-800 transition-all">
                  <MessageCircle className="h-5 w-5 mr-2 text-indigo-400" />
                  Chat with Seller
                </button>
              </div>
            </div>

            {/* Ticket Info */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl">
              <h3 className="text-lg font-bold text-slate-100 mb-6 font-display">Ticket Information</h3>
              <div className="space-y-4">
                <div className="flex items-center text-slate-400 text-base">
                  <Tag className="h-5 w-5 mr-4 text-indigo-500" />
                  {getTicketTypeLabel(ticket.type)}
                </div>
                {ticket.eventDate && (
                  <div className="flex items-center text-slate-400 text-base">
                    <Calendar className="h-5 w-5 mr-4 text-indigo-500" />
                    {formatDate(ticket.eventDate)}
                  </div>
                )}
                {(ticket.venue || ticket.fromLocation) && (
                  <div className="flex items-center text-slate-400 text-base">
                    <MapPin className="h-5 w-5 mr-4 text-indigo-500" />
                    {ticket.venue || `${ticket.fromLocation} → ${ticket.toLocation}`}
                  </div>
                )}
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl">
              <h3 className="text-lg font-bold text-slate-100 mb-6 font-display">Seller Information</h3>
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/5">
                  <User className="h-7 w-7 text-indigo-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-100">{ticket.sellerName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex text-indigo-500"><Star className="w-3.5 h-3.5 fill-current" /></div>
                    <p className="text-sm text-slate-500 font-medium">{ticket.seller?.totalSales || 0} successful sales</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
