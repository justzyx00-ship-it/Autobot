import { hash } from "bcryptjs";
import {
  OrderStatus,
  Prisma,
  PrismaClient,
  Role,
  ThemeMode,
  TopupMethod,
  TopupStatus,
  WalletTransactionType,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await hash("Admin@12345", 12);
  const userPassword = await hash("User@12345", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@satikey.store" },
    update: {
      fullName: "SatiKey Admin",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      theme: ThemeMode.DARK,
    },
    create: {
      email: "admin@satikey.store",
      username: "satikey_admin",
      fullName: "SatiKey Admin",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      theme: ThemeMode.DARK,
      balance: new Prisma.Decimal(0),
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "demo@satikey.store" },
    update: {
      fullName: "Demo User",
      passwordHash: userPassword,
      role: Role.USER,
      theme: ThemeMode.DARK,
    },
    create: {
      email: "demo@satikey.store",
      username: "demo_user",
      fullName: "Demo User",
      passwordHash: userPassword,
      role: Role.USER,
      theme: ThemeMode.DARK,
      balance: new Prisma.Decimal(0),
    },
  });

  const products = [
    {
      slug: "discord-nitro-1-month",
      name: "Discord Nitro 1 Tháng",
      category: "Discord",
      duration: "1 tháng",
      price: new Prisma.Decimal(129000),
      shortDescription: "Nâng cấp Discord Nitro nhanh trong vài phút.",
      description:
        "Dành cho người dùng Discord muốn mở khóa emoji, stream HD và profile nâng cao.",
      icon: "💎",
      isHot: true,
      autoDelivery: true,
      deliveryTemplate:
        "Mã kích hoạt Discord Nitro đã cấp. Vui lòng đổi mã trong 24 giờ để đảm bảo an toàn.",
      soldCount: 420,
    },
    {
      slug: "discord-nitro-3-month",
      name: "Discord Nitro 3 Tháng",
      category: "Discord",
      duration: "3 tháng",
      price: new Prisma.Decimal(339000),
      shortDescription: "Gói Discord Nitro tiết kiệm cho creator.",
      description:
        "Tăng trải nghiệm server và stream với chi phí tối ưu trong 3 tháng.",
      icon: "🚀",
      isHot: true,
      autoDelivery: true,
      deliveryTemplate:
        "Thông tin gói Discord Nitro 3 tháng đã gửi. Hãy kiểm tra hướng dẫn kích hoạt đi kèm.",
      soldCount: 210,
    },
    {
      slug: "discord-nitro-1-year",
      name: "Discord Nitro 1 Năm",
      category: "Discord",
      duration: "1 năm",
      price: new Prisma.Decimal(1199000),
      shortDescription: "Gói Nitro dài hạn dành cho power user.",
      description:
        "Giải pháp tiết kiệm dài hạn, ưu tiên cho streamer và quản trị cộng đồng lớn.",
      icon: "🏆",
      isHot: false,
      autoDelivery: false,
      deliveryTemplate: null,
      soldCount: 90,
    },
    {
      slug: "chatgpt-plus",
      name: "ChatGPT Plus",
      category: "AI Tools",
      duration: "1 tháng",
      price: new Prisma.Decimal(179000),
      shortDescription: "Truy cập GPT nâng cao ổn định và ưu tiên.",
      description:
        "Phù hợp cho người dùng AI chuyên nghiệp, sáng tạo nội dung và làm việc năng suất cao.",
      icon: "🤖",
      isHot: true,
      autoDelivery: false,
      deliveryTemplate: null,
      soldCount: 380,
    },
    {
      slug: "capcut-pro",
      name: "CapCut Pro",
      category: "Creator",
      duration: "1 tháng",
      price: new Prisma.Decimal(99000),
      shortDescription: "Mở khóa template và công cụ edit chuyên sâu.",
      description:
        "Lý tưởng cho TikToker và content creator cần chỉnh sửa nhanh, đẹp và ổn định.",
      icon: "🎬",
      isHot: false,
      autoDelivery: true,
      deliveryTemplate:
        "Tài khoản CapCut Pro đã được liên kết. Nếu cần đổi thiết bị, gửi ticket để được hỗ trợ.",
      soldCount: 275,
    },
    {
      slug: "spotify-premium",
      name: "Spotify Premium",
      category: "Entertainment",
      duration: "1 tháng",
      price: new Prisma.Decimal(59000),
      shortDescription: "Nghe nhạc chất lượng cao, không quảng cáo.",
      description:
        "Dành cho người yêu âm nhạc cần trải nghiệm premium với chi phí hợp lý.",
      icon: "🎵",
      isHot: false,
      autoDelivery: true,
      deliveryTemplate:
        "Gói Spotify Premium đã kích hoạt. Bạn có thể kiểm tra ngay trong trang tài khoản Spotify.",
      soldCount: 520,
    },
    {
      slug: "netflix-premium",
      name: "Netflix Premium",
      category: "Entertainment",
      duration: "1 tháng",
      price: new Prisma.Decimal(119000),
      shortDescription: "Xem 4K và đa thiết bị ổn định.",
      description:
        "Gói giải trí cho gia đình và cá nhân, hỗ trợ nhiều thiết bị cùng lúc.",
      icon: "📺",
      isHot: true,
      autoDelivery: false,
      deliveryTemplate: null,
      soldCount: 310,
    },
    {
      slug: "youtube-premium",
      name: "YouTube Premium",
      category: "Entertainment",
      duration: "1 tháng",
      price: new Prisma.Decimal(79000),
      shortDescription: "Xem YouTube không quảng cáo, phát nền tiện lợi.",
      description:
        "Lựa chọn phù hợp cho người xem YouTube thường xuyên và cần trải nghiệm mượt.",
      icon: "▶️",
      isHot: false,
      autoDelivery: true,
      deliveryTemplate:
        "YouTube Premium đã kích hoạt thành công. Vui lòng đăng xuất và đăng nhập lại ứng dụng nếu chưa thấy thay đổi.",
      soldCount: 460,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  await prisma.notification.deleteMany();
  await prisma.order.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.topup.deleteMany();
  await prisma.review.deleteMany();
  await prisma.supportTicket.deleteMany();

  const youtube = await prisma.product.findUniqueOrThrow({
    where: { slug: "youtube-premium" },
  });

  const nitro3m = await prisma.product.findUniqueOrThrow({
    where: { slug: "discord-nitro-3-month" },
  });

  let balance = new Prisma.Decimal(0);

  const firstTopup = await prisma.topup.create({
    data: {
      userId: user.id,
      method: TopupMethod.CARD,
      provider: "Viettel",
      amount: new Prisma.Decimal(500000),
      status: TopupStatus.SUCCESS,
      referenceCode: `CARD-${Date.now()}`,
      note: "Nạp thẻ tự động thành công",
      processedAt: new Date(),
    },
  });

  balance = balance.plus(firstTopup.amount);

  await prisma.walletTransaction.create({
    data: {
      userId: user.id,
      amount: firstTopup.amount,
      balanceAfter: balance,
      type: WalletTransactionType.TOPUP,
      description: "Nạp thẻ cào tự động",
      referenceId: firstTopup.id,
    },
  });

  const completedOrder = await prisma.order.create({
    data: {
      userId: user.id,
      productId: youtube.id,
      status: OrderStatus.COMPLETED,
      price: youtube.price,
      amount: youtube.price,
      deliveryData:
        "Thông tin giao hàng: Gói YouTube Premium đã kích hoạt. Mã tham chiếu YT-EXAMPLE-9988.",
      completedAt: new Date(),
    },
  });

  balance = balance.minus(completedOrder.amount);

  await prisma.walletTransaction.create({
    data: {
      userId: user.id,
      amount: completedOrder.amount.negated(),
      balanceAfter: balance,
      type: WalletTransactionType.PURCHASE,
      description: "Thanh toán đơn hàng YouTube Premium",
      referenceId: completedOrder.id,
    },
  });

  await prisma.order.create({
    data: {
      userId: user.id,
      productId: nitro3m.id,
      status: OrderStatus.PROCESSING,
      price: nitro3m.price,
      amount: nitro3m.price,
      note: "Đơn hàng đang được xử lý bán tự động",
    },
  });

  await prisma.topup.create({
    data: {
      userId: user.id,
      method: TopupMethod.BANK_QR,
      amount: new Prisma.Decimal(200000),
      status: TopupStatus.PROCESSING,
      referenceCode: `BANK-${Date.now()}`,
      note: "Chờ đối soát chuyển khoản",
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { balance },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      title: "Đơn hàng đã hoàn thành",
      message:
        "Đơn YouTube Premium của bạn đã hoàn tất. Vào mục lịch sử đơn để nhận thông tin giao hàng.",
      isRead: false,
    },
  });

  await prisma.review.createMany({
    data: [
      {
        customer: "minh streamer",
        content: "Mua Nitro giao siêu nhanh, hỗ trợ Discord rất nhiệt tình.",
        rating: 5,
        service: "Discord Nitro",
      },
      {
        customer: "luna creator",
        content: "ChatGPT Plus ổn định, dùng cho công việc mỗi ngày rất ok.",
        rating: 5,
        service: "ChatGPT Plus",
      },
      {
        customer: "khoa edit video",
        content: "CapCut Pro nhận tài khoản rõ ràng, dùng mượt trên mobile.",
        rating: 4,
        service: "CapCut Pro",
      },
    ],
  });

  console.log("Seed completed");
  console.log(`Admin account: ${admin.email} / Admin@12345`);
  console.log(`Demo account: ${user.email} / User@12345`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
