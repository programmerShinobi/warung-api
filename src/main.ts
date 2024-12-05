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

  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'dev'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'debug', 'log', 'verbose'],
  });

  const log = new Logger(bootstrap.name);
  const PORT = Number(process.env.APPLICATION_PORT) || 3000;

  // VMemvalidasi aliran masukan permintaan
  app.useGlobalPipes(new ValidationPipe());

  // Pembuatan versi
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Connect to API
  if (process.env.NODE_ENV !== 'prod') {
    app.enableCors();
  }

  // Enable Prisma auto shutdown hooks
  app.enableShutdownHooks();

  // Konfigurasi Swagger
  const options = new DocumentBuilder()
    .setTitle(process.env.APPLICATION_NAME)
    .setDescription('API documentation for Warung convenience store')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document); // Dokumentasi Swagger tersedia di "<URL>/api"

  await app.listen(PORT);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  log.log(
    `${process.env.APPLICATION_NAME} (${process.env.npm_package_version}) start on port ${PORT}`,
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

      let borderMaxLength = 0;

      console.log('\n' + data);
      const formatInfo = (label: string, value: string) => {
        return `${label.padEnd(20)}: ${value.padStart(10)}`;
      };

      console.log(`\nApplication Info`);
      const versionLine = formatInfo(
        'Version',
        process.env.npm_package_version || 'N/A',
      );
      const portLine = formatInfo(
        'Port',
        process.env.APPLICATION_PORT || 'N/A',
      );
      const nodeEnvLine = formatInfo(
        'Node',
        process.env.NODE_ENV === 'prod'
          ? 'Production'
          : process.env.NODE_ENV === 'dev'
            ? 'Development'
            : process.env.NODE_ENV === 'local'
              ? 'Local'
              : 'N/A',
      );
      const corsLine = formatInfo(
        'CORS',
        process.env.NODE_ENV !== 'prod' ? 'Enable' : 'Disable',
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
