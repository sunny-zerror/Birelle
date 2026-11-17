"use client";

import { Link } from "next-view-transitions";
import { useAuth } from "@/components/providers/AuthProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useAddresses } from "@/hooks/useAddresses";
import { useOrders } from "@/hooks/useOrders";
import { formatPrice } from "@/data/products";
import { formatPhone } from "@/lib/countries";
import { formatDate, formatMonth } from "@/utils/date";
import { AccountHeading, ArrowLink, Panel, StatusBadge } from "./ui";
import { ImageSkeleton } from "@/components/ui/skeleton";

const AccountOverview = () => {
  const { user } = useAuth();
  const { items: wishlist } = useWishlist();
  const { orders } = useOrders();
  const { defaultAddress } = useAddresses();
  if (!user) return null;

  const latest = orders[0];

  return (
    <div className="account-overview">
      <AccountHeading
        title="Overview"
        description={`Member since ${formatMonth(user.createdAt)}. Track your orders, keep pieces for later and manage your details.`}
      />

      <div className="mt-8 grid gap-4 md:mt-10 lg:grid-cols-2 lg:gap-6">
        {/* Latest order */}
        <Panel title="Latest order" action={orders.length > 0 && <ArrowLink href="/account/orders">All orders</ArrowLink>}>
          {latest ? (
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm text-ink">{latest.number}</p>
                <StatusBadge status={latest.status} />
              </div>
              <p className="mt-1.5 text-xs text-muted">
                {formatDate(latest.placedAt)} · {formatPrice(latest.total)}
              </p>
              <ul className="mt-5 flex gap-2">
                {latest.lines.slice(0, 4).map((l) => (
                  <li key={`${l.productId}-${l.size}-${l.colour}`} className="aspect-3/4 w-14 overflow-hidden bg-neutral-100">
                    <ImageSkeleton className="size-full"><img src={l.image} alt={l.title} loading="lazy" className="cover" /></ImageSkeleton>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-muted">
              You haven&apos;t placed an order yet.{" "}
              <Link href="/shop" className="text-ink underline underline-offset-4 hover:opacity-60">
                Start shopping
              </Link>
            </p>
          )}
        </Panel>

        {/* Wishlist */}
        <Panel title="Wishlist" action={<ArrowLink href="/account/wishlist">View wishlist</ArrowLink>}>
          {wishlist.length > 0 ? (
            <div>
              <p className="text-sm text-ink">
                {wishlist.length} saved {wishlist.length === 1 ? "piece" : "pieces"}
              </p>
              <ul className="mt-5 flex gap-2">
                {wishlist.slice(0, 4).map((p) => (
                  <li key={p.id}>
                    <Link href={p.href} className="center block aspect-3/4 w-14 overflow-hidden bg-neutral-100">
                      <ImageSkeleton className="center size-full"><img src={p.image} alt={p.title} loading="lazy" className="w-[85%]" /></ImageSkeleton>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-muted">Tap the heart on any piece to keep it here for later.</p>
          )}
        </Panel>

        {/* Default address */}
        <Panel title="Default address" action={<ArrowLink href="/account/addresses">Manage</ArrowLink>}>
          {defaultAddress ? (
            <address className="text-sm not-italic leading-relaxed text-ink">
              {defaultAddress.name}
              <br />
              {defaultAddress.line1}
              {defaultAddress.line2 && `, ${defaultAddress.line2}`}
              <br />
              {defaultAddress.city} {defaultAddress.postalCode}, {defaultAddress.country}
            </address>
          ) : (
            <p className="text-sm leading-relaxed text-muted">Save an address for a quicker checkout.</p>
          )}
        </Panel>

        {/* Details */}
        <Panel title="Account details" action={<ArrowLink href="/account/settings">Edit</ArrowLink>}>
          <dl className="grid grid-cols-[5.5rem_1fr] gap-x-4 gap-y-2.5 text-sm">
            <dt className="text-muted">Name</dt>
            <dd className="truncate text-ink">
              {user.firstName} {user.lastName}
            </dd>
            <dt className="text-muted">Email</dt>
            <dd className="truncate text-ink">{user.email}</dd>
            <dt className="text-muted">Phone</dt>
            <dd className="truncate text-ink">{formatPhone(user.phoneCountry, user.phone)}</dd>
          </dl>
        </Panel>
      </div>
    </div>
  );
};

export default AccountOverview;
