import React, { useRef, useCallback } from 'react';
import { FiLock } from 'react-icons/fi';
import { Form } from '@unform/web';
import { FormHandles } from '@unform/core';
import * as Yup from 'yup';
import { useHistory, useLocation } from 'react-router-dom';

import getValidationErrors from '../../utils/getValidationErrors';
import { Container, Content, Background, AnimationContainer } from './styles';
import logoImg from '../../assets/logo.svg';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useToast } from '../../hooks/toast';
import api from '../../services/api';

interface ResetPasswordFormData {
  password: string;
  passwordConfirmation: string;
}

const ResetPassword: React.FC = () => {
  const formRef = useRef<FormHandles>(null);

  const { addToast } = useToast();

  const history = useHistory();

  const location = useLocation();

  const handleSubmit = useCallback(
    async (data: ResetPasswordFormData) => {
      try {
        formRef.current?.setErrors({});
        const schema = Yup.object().shape({
          passwordConfirmation: Yup.string().oneOf(
            [Yup.ref('password'), undefined],
            'Confirmação incorreta.',
          ),
          password: Yup.string().required('Senha obrigatória.'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const { password, passwordConfirmation } = data;

        const token = location.search.replace('?token=', '');

        if (!token) {
          throw new Error();
        }

        api.post('/password/reset', {
          password,
          passwordConfirmation,
          token,
        });

        history.push('/');
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);

          return;
        }

        addToast({
          type: 'error',
          title: 'Erro ao resetar senha',
          description: 'Erro a resetar senha, tenta novamente',
        });
      }
    },
    [history, addToast, location.search],
  );

  return (
    <Container>
      <Content>
        <AnimationContainer>
          <img src={logoImg} alt="GoBarber" />
          <Form ref={formRef} onSubmit={handleSubmit}>
            <h1>Resetar Senha</h1>

            <Input
              name="password"
              icon={FiLock}
              type="password"
              placeholder="nova senha"
            />

            <Input
              name="passwordConfirmation"
              icon={FiLock}
              type="password"
              placeholder="confirmação de senha"
            />

            <Button type="submit">Alterar senha</Button>
          </Form>
        </AnimationContainer>
      </Content>
      <Background />
    </Container>
  );
};

export default ResetPassword;
