import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? 'admin123', 12);

  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? 'admin@meganet.com.br' },
    update: {},
    create: {
      name: process.env.ADMIN_NAME ?? 'Administrador',
      email: process.env.ADMIN_EMAIL ?? 'admin@meganet.com.br',
      passwordHash
    }
  });

  await prisma.siteSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: {}
  });

  await prisma.companyInfo.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      phone: '(00) 0000-0000',
      whatsapp: '5500000000000',
      email: 'contato@meganet.com.br',
      address: 'Av. Principal, 1000',
      city: 'Sua Cidade',
      state: 'UF',
      businessHours: 'Segunda a sexta, 8h às 18h. Sábado, 8h às 12h.',
      cnpj: '00.000.000/0001-00',
      aboutText: 'A MEGANET conecta residências e empresas com internet rápida, atendimento próximo e infraestrutura preparada para alta disponibilidade.',
      history: 'Nascemos para entregar uma experiência de conexão mais estável, transparente e humana para clientes que dependem de internet todos os dias.',
      differentials: JSON.stringify(['Fibra óptica de alta velocidade', 'Suporte humanizado', 'Planos para casa e empresa', 'Rede monitorada']),
      yearsInBusiness: 8,
      customerCount: 4200,
      citiesServed: 'Sua Cidade e região'
    }
  });

  await prisma.missionVisionValues.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      mission: 'Conectar pessoas e empresas com internet estável, rápida e atendimento de verdade.',
      vision: 'Ser reconhecida como a provedora mais confiável da região.',
      values: 'Transparência, proximidade, excelência técnica, respeito ao cliente e melhoria contínua.',
      complement: 'Trabalhamos para que cada cliente tenha segurança para estudar, vender, trabalhar e se divertir online.'
    }
  });

  if ((await prisma.featureHighlight.count()) === 0) {
    await prisma.featureHighlight.createMany({
      data: [
        { title: 'Mega Fibra', icon: 'Gauge', sortOrder: 1 },
        { title: 'Suporte Total', icon: 'ShieldCheck', sortOrder: 2 },
        { title: 'Ponto Gamer', icon: 'Gamepad2', sortOrder: 3 }
      ]
    });
  }

  if ((await prisma.planComplement.count()) === 0) {
    await prisma.planComplement.createMany({
      data: [
        { name: 'CAS TV', category: 'app', sortOrder: 1 },
        { name: 'Deezer', category: 'app', sortOrder: 2 },
        { name: 'PlayKids+', category: 'app', sortOrder: 3 }
      ]
    });
  }

  if ((await prisma.banner.count()) === 0) {
    await prisma.banner.createMany({
      data: [
      {
        title: 'Internet fibra para ir mais longe',
        subtitle: 'Planos rápidos, estáveis e com suporte próximo para sua casa ou empresa.',
        buttonText: 'Ver planos',
        buttonLink: '/planos',
        highlights: JSON.stringify(['Maior velocidade', 'Baixa latência', 'Wi-Fi otimizado', 'Mais dispositivos']),
        sortOrder: 1
      },
      {
        title: 'Link dedicado para empresas',
        subtitle: 'Performance previsível, atendimento profissional e conexão pensada para operação crítica.',
        buttonText: 'Consultar cobertura',
        buttonLink: '/cobertura',
        highlights: JSON.stringify(['SLA profissional', 'Suporte prioritário', 'IP fixo opcional', 'Rede monitorada']),
        sortOrder: 2
      }
      ]
    });
  }

  if ((await prisma.internetPlan.count()) === 0) {
    await prisma.internetPlan.createMany({
      data: [
      {
        name: 'Fibra 300 Mega',
        downloadMbps: 300,
        uploadMbps: 150,
        priceCents: 8990,
        type: 'residencial',
        description: 'Ideal para streaming, estudos e rotina conectada.',
        benefits: JSON.stringify(['Instalação rápida', 'Wi-Fi otimizado', 'Suporte local']),
        featured: false,
        sortOrder: 1
      },
      {
        name: 'Fibra 600 Mega',
        downloadMbps: 600,
        uploadMbps: 300,
        priceCents: 11990,
        type: 'residencial',
        description: 'Mais velocidade para casas com muitos dispositivos.',
        benefits: JSON.stringify(['Mais estabilidade', 'Baixa latência', 'Plano recomendado']),
        featured: true,
        sortOrder: 2
      },
      {
        name: 'Empresarial 800 Mega',
        downloadMbps: 800,
        uploadMbps: 400,
        priceCents: 19990,
        type: 'empresarial',
        description: 'Conexão robusta para equipes, sistemas e atendimento online.',
        benefits: JSON.stringify(['Prioridade comercial', 'Suporte especializado', 'Monitoramento de rede']),
        featured: false,
        sortOrder: 3
      }
      ]
    });
  }

  const category = await prisma.blogCategory.upsert({
    where: { slug: 'dicas-de-internet' },
    update: {},
    create: {
      name: 'Dicas de internet',
      slug: 'dicas-de-internet',
      description: 'Conteúdos para melhorar sua conexão e segurança digital.'
    }
  });

  await prisma.blogPost.upsert({
    where: { slug: 'como-melhorar-o-sinal-do-wifi' },
    update: {},
    create: {
      title: 'Como melhorar o sinal do Wi-Fi em casa',
      slug: 'como-melhorar-o-sinal-do-wifi',
      summary: 'Pequenos ajustes de posicionamento e configuração podem melhorar muito sua experiência.',
      content: '<p>Coloque o roteador em um ponto central, longe de barreiras grossas e equipamentos que causam interferência. Para casas maiores, considere uma solução mesh.</p>',
      author: 'Equipe MEGANET',
      status: 'published',
      publishedAt: new Date(),
      categoryId: category.id,
      seoTitle: 'Como melhorar o Wi-Fi em casa | MEGANET',
      seoDescription: 'Veja dicas simples para melhorar o sinal do Wi-Fi.'
    }
  });

  if ((await prisma.testimonial.count()) === 0) {
    await prisma.testimonial.createMany({
      data: [
      { name: 'Mariana Souza', text: 'A internet ficou muito mais estável e o atendimento sempre resolve rápido.', location: 'Centro', rating: 5, sortOrder: 1 },
      { name: 'Carlos Lima', text: 'Uso na empresa e a diferença no suporte foi enorme. Recomendo.', location: 'Distrito Comercial', rating: 5, sortOrder: 2 }
      ]
    });
  }

  if ((await prisma.socialLink.count()) === 0) {
    await prisma.socialLink.createMany({
      data: [
      { name: 'Instagram', url: 'https://instagram.com/', sortOrder: 1 },
      { name: 'Facebook', url: 'https://facebook.com/', sortOrder: 2 },
      { name: 'WhatsApp', url: 'https://wa.me/5500000000000', sortOrder: 3 }
      ]
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
