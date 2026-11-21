import { Button } from '@mantine/core';
import { Link } from 'react-router';

import classes from './LandingContent.module.css';

export function LandingContent() {
  return (
    <>
      <section className={classes.hero}>
        <div className={classes.copy}>
          <p className={classes.eyebrow}>Онлайн-редактор резюме</p>
          <h1>Ваш опыт заслуживает ясной формы.</h1>
          <p className={classes.lead}>
            Соберите резюме, выберите оформление и делитесь актуальной версией по ссылке.
          </p>
          <div className={classes.actions}>
            <Button component={Link} to="/auth/register" size="lg" radius="sm">
              Создать резюме
            </Button>
            <a href="#features">Как это работает</a>
          </div>
        </div>

        <div className={classes.preview}>
          <div className={classes.previewTop}>
            <span>Пример оформления</span>
            <span className={classes.previewDot} aria-hidden="true" />
          </div>
          <article className={classes.resume} aria-label="Пример оформления резюме">
            <header className={classes.resumeHeader}>
              <div>
                <span className={classes.resumeLabel}>Резюме</span>
                <h2>Ваше имя</h2>
                <p>Желаемая должность</p>
              </div>
              <div className={classes.resumeMark} aria-hidden="true">
                ОР
              </div>
            </header>
            <div className={classes.resumeBody}>
              <aside className={classes.resumeAside}>
                <h3>Контакты</h3>
                <span>Электронная почта</span>
                <span>Телефон</span>
                <span>Ссылки</span>
                <h3>Навыки</h3>
                <span>Ваши навыки</span>
              </aside>
              <div className={classes.resumeMain}>
                <h3>О себе</h3>
                <p>Коротко расскажите о своём опыте и о том, чем хотите заниматься.</p>
                <h3>Опыт работы</h3>
                <div className={classes.entry}>
                  <strong>Место работы</strong>
                  <span>Роль и период работы</span>
                </div>
                <h3>Образование</h3>
                <div className={classes.entry}>
                  <strong>Учебное заведение</strong>
                  <span>Направление и период обучения</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className={classes.features} id="features">
        <p className={classes.eyebrow}>От черновика до ссылки</p>
        <div className={classes.featureGrid}>
          <div>
            <h2>Одно место для всех версий</h2>
            <p>Обновляйте опыт и контакты, когда они меняются.</p>
          </div>
          <div>
            <h2>Оформление под задачу</h2>
            <p>Меняйте шаблон, сохраняя содержимое резюме.</p>
          </div>
          <div>
            <h2>Готово к отправке</h2>
            <p>Публикуйте резюме по ссылке или сохраняйте версию в PDF.</p>
          </div>
        </div>
      </section>
    </>
  );
}
