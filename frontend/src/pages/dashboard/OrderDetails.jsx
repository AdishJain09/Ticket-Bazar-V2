import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, User, CreditCard, Shield, CheckCircle, Clock, Package, Ticket } from 'lucide-react';
import { ordersAPI } from '../../utils/api';
import { formatDate, formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await ordersAPI.getById(id);
      setOrder(response.data.data.order);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Order not found');
      navigate('/dashboard/orders');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      confirmed: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    };
    return styles[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="card h-96" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-300">Order not found</h3>
        <Link to="/dashboard/orders" className="btn-primary mt-4 inline-flex">
          Back to Orders
        </Link>
      </div>
    );
  }

  const qty = order.quantity || 1;
  const unitPrice = order.ticket?.resalePrice || (order.amount / qty);
  const isPendingPayment = order.payment?.status === 'pending' && order.status === 'pending';

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link to="/dashboard/orders" className="inline-flex items-center text-slate-400 hover:text-indigo-400">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Orders
      </Link>

      {/* Order Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Order #{order.orderNumber}</h1>
          <p className="text-slate-400 mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusBadge(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          {isPendingPayment && (
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
              Payment Due
            </span>
          )}
        </div>
      </div>

      {/* Payment Due Banner */}
      {isPendingPayment && (
        <div className="card p-6 border-amber-500/30 bg-amber-500/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-amber-400 mb-1">Complete Your Payment</h3>
              <p className="text-sm text-slate-400">
                Your order is reserved. Complete payment to secure your {qty > 1 ? `${qty} tickets` : 'ticket'}.
              </p>
            </div>
            <Link 
              to={`/checkout/${order._id}`}
              className="sell-cta !text-base"
            >
              <CreditCard className="h-5 w-5" />
              Pay {formatCurrency(order.amount)}
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Ticket Details</h2>
            
            <div className="flex gap-4 mb-4">
              <div className="w-24 h-24 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                {order.ticket?.images?.[0] ? (
                  <img 
                    src={order.ticket.images[0].url} 
                    alt={order.ticket.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-3xl">🎫</span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-lg">{order.ticket?.title}</h3>
                <p className="text-slate-400 text-sm mt-1">{order.ticket?.type}</p>
                {qty > 1 && (
                  <p className="text-amber-400 text-sm font-medium flex items-center gap-1 mt-1">
                    <Ticket className="h-4 w-4" />
                    {qty} tickets
                  </p>
                )}
                {order.ticket?.eventDate && (
                  <p className="text-slate-400 text-sm flex items-center gap-1 mt-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(order.ticket.eventDate)}
                  </p>
                )}
                {order.ticket?.venue && (
                  <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    {order.ticket.venue}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <h4 className="font-medium text-slate-100 mb-2">Seller Information</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-slate-200">{order.seller?.name || 'Unknown'}</p>
                  <p className="text-slate-500 text-sm">{order.seller?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Order Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-slate-200">Order Placed</p>
                  <p className="text-slate-500 text-sm">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              {order.payment?.status === 'completed' && (
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="text-slate-200">Payment Completed</p>
                    <p className="text-slate-500 text-sm">{formatDate(order.payment.paidAt)}</p>
                  </div>
                </div>
              )}
              {order.payment?.status === 'pending' && (
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-400 animate-pulse" />
                  <div>
                    <p className="text-amber-400">Awaiting Payment</p>
                    <p className="text-slate-500 text-sm">Complete payment to proceed</p>
                  </div>
                </div>
              )}
              {order.escrowStatus === 'held' && (
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-indigo-400" />
                  <div>
                    <p className="text-slate-200">Payment in Escrow</p>
                    <p className="text-slate-500 text-sm">Waiting for ticket transfer</p>
                  </div>
                </div>
              )}
              {order.status === 'completed' && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="text-slate-200">Order Completed</p>
                    <p className="text-slate-500 text-sm">{formatDate(order.completedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Payment Breakdown</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-slate-300">
                <span>Unit Price</span>
                <span>{formatCurrency(unitPrice)}</span>
              </div>
              {qty > 1 && (
                <div className="flex justify-between text-slate-300">
                  <span>Quantity</span>
                  <span>{qty}× tickets</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span>{formatCurrency(unitPrice * qty)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Platform Fee (5%)</span>
                <span>{formatCurrency(order.platformFee)}</span>
              </div>
              <div className="border-t border-slate-700 pt-3 flex justify-between text-lg font-semibold text-slate-100">
                <span>{order.payment?.status === 'completed' ? 'Total Paid' : 'Total Payable'}</span>
                <span className={order.payment?.status === 'completed' ? '' : 'text-amber-400'}>
                  {formatCurrency(order.amount)}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-5 w-5 text-slate-400" />
                <span className="text-slate-300">Payment Status</span>
              </div>
              <p className={`font-medium ${order.payment?.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {order.payment?.status === 'completed' ? '✓ Paid' : '⏳ Pending'}
              </p>
            </div>

            {/* Pay Now button in summary */}
            {isPendingPayment && (
              <Link 
                to={`/checkout/${order._id}`}
                className="sell-cta w-full mt-4 justify-center"
              >
                <CreditCard className="h-5 w-5" />
                Complete Payment
              </Link>
            )}
          </div>

          {/* Escrow Info */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-indigo-400" />
              <h3 className="font-semibold text-slate-100">Escrow Protection</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Your payment is held securely in escrow until you receive and verify the ticket.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status</span>
              <span className={`font-medium ${
                order.escrowStatus === 'released' ? 'text-emerald-400' :
                order.escrowStatus === 'held' ? 'text-indigo-400' :
                'text-amber-400'
              }`}>
                {order.escrowStatus?.charAt(0).toUpperCase() + order.escrowStatus?.slice(1)}
              </span>
            </div>
          </div>

          {/* Actions */}
          {order.status === 'confirmed' && (
            <div className="card p-6">
              <h3 className="font-semibold text-slate-100 mb-3">Actions</h3>
              <button 
                className="btn-primary w-full"
                onClick={() => toast.success('Ticket received confirmation sent!')}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                I Received the Ticket
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
