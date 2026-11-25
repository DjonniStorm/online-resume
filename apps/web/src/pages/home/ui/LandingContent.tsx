import { Button } from '@mantine/core';
import { Link } from 'react-router';

import classes from './LandingContent.module.css';

export function LandingContent() {
  return (
    <>
      <section className={classes.hero}>
        <div className={classes.copy}>
          <p className={classes.eyebrow}>Онлайн-редактор резюме</p>
          <h1>Создайте резюме онлайн</h1>
          <p className={classes.lead}>
            Заполните данные в редакторе и выберите оформление. Готовое резюме можно опубликовать
            или скачать в PDF.
          </p>
          <div className={classes.actions}>
            <Button component={Link} to="/auth/register" size="lg" radius="sm">
              Создать резюме
            </Button>
            <a href="#features">Возможности</a>
          </div>
        </div>

        <div className={classes.preview}>
          <div className={classes.previewTop}>
            <span>Варианты оформления</span>
          </div>
          <img
            className={classes.layoutIllustration}
            src="/resume-layouts.svg"
            alt="Три варианта оформления резюме"
            width="600"
            height="410"
          />
        </div>
      </section>

      <section className={classes.features} id="features">
        <h2 className={classes.sectionHeading}>Возможности</h2>
        <div className={classes.featureGrid}>
          <div>
            <h3>Редактор</h3>
            <p>Заполняйте разделы резюме, добавляйте фото. Изменения сохраняются автоматически.</p>
          </div>
          <div>
            <h3>Шаблоны</h3>
            <p>Выбирайте оформление и меняйте его без повторного заполнения.</p>
          </div>
          <div>
            <h3>Публикация</h3>
            <p>Делитесь ссылкой на актуальную версию резюме.</p>
          </div>
          <div>
            <h3>PDF</h3>
            <p>Скачивайте резюме файлом для отправки.</p>
          </div>
        </div>
      </section>
    </>
  );
}
