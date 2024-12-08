import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as Events from 'events';
import * as dotenv from 'dotenv';
import * as figlet from 'figlet';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';

dotenv.config({ path: `${process.cwd()}/.env` });
declare const module: any;

/**
 * Bootstrap aplikasi NestJS.
 */
async function bootstrap() {
  Events.setMaxListeners(1500);

  const nodeEnvironment = process.env.NODE_ENV;
  const applicationName = process.env.APPLICATION_NAME;
  const applicationPort = Number(process.env.APPLICATION_PORT) || 3000;
  const applocationVersion = process.env.npm_package_version;

  const app = await NestFactory.create(AppModule, {
    logger:
      nodeEnvironment === 'prod' || nodeEnvironment === 'dev'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'debug', 'log', 'verbose'],
  });

  const log = new Logger(bootstrap.name);

  // Memvalidasi aliran masukan permintaan
  app.useGlobalPipes(new ValidationPipe());

  // Pembuatan versi
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Connect to API
  if (nodeEnvironment !== 'prod') {
    app.enableCors();
  }

  // Enable Prisma auto shutdown hooks
  app.enableShutdownHooks();

  // Konfigurasi Swagger
  const options = new DocumentBuilder()
    .setTitle(applicationName)
    .setDescription('API documentation for Warung convenience store')
    .setVersion(applocationVersion)
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document); // Dokumentasi Swagger tersedia di "<URL>/api"

  await app.listen(applicationPort);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  log.log(
    `${applicationName} (${applocationVersion}) start on port ${applicationPort}`,
  );

  showBanner();
}

function showBanner(): void {
  interface Coder {
    username: string;
    personalName: string;
  }

  const mainCoders: Coder[] = [
    {
      personalName: 'Faqih Pratama Muhti',
      username: '@shinobi',
    },
  ];

  figlet(
    'Warung API',
    {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      whitespaceBreak: false,
    },
    function (err, data) {
      if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
      }

      const nodeEnvironment = process.env.NODE_ENV;
      const applicationPort = Number(process.env.APPLICATION_PORT) || 3000;
      const applocationVersion = process.env.npm_package_version || 'N/A';

      let borderMaxLength = 0;

      console.log('\n' + data);
      const formatInfo = (label: string, value: string) => {
        return `${label.padEnd(20)}: ${value.padStart(10)}`;
      };

      console.log(`\nApplication Info`);
      const versionLine = formatInfo('Version', applocationVersion);
      const portLine = formatInfo('Port', applicationPort.toString());
      const nodeEnvLine = formatInfo(
        'Node',
        nodeEnvironment === 'prod'
          ? 'Production'
          : nodeEnvironment === 'dev'
            ? 'Development'
            : nodeEnvironment === 'local'
              ? 'Local'
              : 'N/A',
      );
      const corsLine = formatInfo(
        'CORS',
        nodeEnvironment !== 'prod' ? 'Enable' : 'Disable',
      );

      console.log(nodeEnvLine);
      console.log(corsLine);
      console.log(versionLine);
      console.log(portLine);

      // Calculate the border length based on the longest line
      const borderLength = Math.max(
        versionLine.length,
        portLine.length,
        nodeEnvLine.length,
      );
      console.log('»'.repeat(borderLength));
      console.log(`\nMain Coder(s)`);

      mainCoders.forEach((coder) => {
        const creditStr = `Ø ${coder.username.padEnd(17)} : ${
          coder.personalName
        }`;
        borderMaxLength = Math.max(borderMaxLength, creditStr.length);
        console.log(creditStr);
      });

      console.log(`»`.repeat(borderMaxLength));
      console.log(`\nMemory Usage`);

      const memoryData = process.memoryUsage();
      const totalMemoryUsage = Object.values(memoryData).reduce(
        (acc, value) => acc + value,
        0,
      );

      const formatMemoryUsage = (label: string, value: number) =>
        `${label.padEnd(20)}: ${value.toString().padStart(15)} bytes | ${(
          value /
          (1024 * 1024)
        )
          .toFixed(2)
          .padStart(10)} MiB`;

      // Store formatted lines to calculate the longest one
      const rssLine = formatMemoryUsage('RSS', memoryData.rss);
      const heapTotalLine = formatMemoryUsage(
        'Heap Total',
        memoryData.heapTotal,
      );
      const heapUsedLine = formatMemoryUsage('Heap Used', memoryData.heapUsed);
      const externalLine = formatMemoryUsage('External', memoryData.external);
      const arrayBuffersLine = formatMemoryUsage(
        'Array Buffers',
        memoryData.arrayBuffers,
      );
      const totalMemoryLine = formatMemoryUsage(
        'Total Memory Usage',
        totalMemoryUsage,
      );

      // Output the formatted lines
      console.log(rssLine);
      console.log(heapTotalLine);
      console.log(heapUsedLine);
      console.log(externalLine);
      console.log(arrayBuffersLine);
      console.log(totalMemoryLine);

      // Calculate the border length based on the longest line
      const memoryBorderLength = Math.max(
        rssLine.length,
        heapTotalLine.length,
        heapUsedLine.length,
        externalLine.length,
        arrayBuffersLine.length,
        totalMemoryLine.length,
      );
      console.log('»'.repeat(memoryBorderLength));
      console.log('\n'); // Add a newline after the memory section
    },
  );
}
bootstrap();
